const express = require('express');
const { createHash } = require('node:crypto');
const Resume = require('../models/Resume');
const User = require('../models/User');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router({ mergeParams: true });
const fileType = 'application/pdf';
const maxSize = 5 * 1024 * 1024;
const metadata = 'name size createdAt';
const parsePdf = express.raw({ type: fileType, limit: maxSize, inflate: false });

router.param('resumeId', validateObjectId);
router.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
});

router.get('/', async (req, res) => {
  const resumes = await Resume.find({ owner: req.userId })
    .select(metadata)
    .sort({ createdAt: -1, _id: -1 })
    .lean();
  res.json({ resumes });
});

function readPdf(req, res, next) {
  if (!req.is(fileType)) {
    return res.status(415).json({ error: 'Upload a PDF file.' });
  }
  parsePdf(req, res, error => {
    if (error?.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Choose a PDF that is 5 MB or smaller.' });
    }
    if (error?.status === 415) {
      return res.status(415).json({ error: 'Send the PDF without HTTP compression.' });
    }
    next(error);
  });
}

function readName(header = '') {
  try {
    const name = decodeURIComponent(header).trim();
    if (name.length > 255 || /[/\\\x00-\x1f\x7f]/.test(name) || !/\.pdf$/i.test(name) || name.length <= 4) {
      return null;
    }
    return name;
  } catch {
    return null;
  }
}

router.post('/', readPdf, async (req, res) => {
  const name = readName(req.get('X-Resume-Filename'));
  if (!name) {
    return res.status(400).json({ error: 'Provide a valid PDF filename.' });
  }

  const content = req.body;
  if (!Buffer.isBuffer(content) || !/^%PDF-\d\.\d[\r\n]/.test(content.toString('latin1', 0, 9))
    || !content.subarray(-1024).includes('%%EOF')) {
    return res.status(400).json({ error: 'This file does not appear to be a PDF.' });
  }
  if (!await User.exists({ _id: req.userId })) {
    return res.status(404).json({ error: 'User not found' });
  }

  // The owner and file hash make a repeat upload safe after a network retry.
  const filter = { owner: req.userId, digest: createHash('sha256').update(content).digest('hex') };
  const resume = await Resume.findOneAndUpdate(filter, {
    $setOnInsert: { name, size: content.length, createdAt: new Date(), content }
  }, { upsert: true, returnDocument: 'after' }).select(metadata).lean();
  res.json({ resume });
});

router.get('/:resumeId', async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.resumeId, owner: req.userId })
    .select('name +content');
  if (!resume) return res.status(404).json({ error: 'Resume not found' });

  res.set('X-Content-Type-Options', 'nosniff');
  res.attachment(resume.name).type(fileType).send(resume.content);
});

router.delete('/:resumeId', async (req, res) => {
  await Resume.deleteOne({ _id: req.params.resumeId, owner: req.userId });
  res.status(204).end();
});

module.exports = router;

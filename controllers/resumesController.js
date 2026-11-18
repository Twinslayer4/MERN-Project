const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { Resume } = require('../models');

// Set UPLOAD_DIR in .env to a folder OUTSIDE the repo on the droplet
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads', 'resumes');
const MAX_RESUMES = 5;

// Strip any path and control characters from the user's file name
const cleanName = (name = '') =>
  path.basename(name).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200) || 'resume.pdf';

// Loads a resume and checks the caller owns it; sends the error itself and returns null if not
async function loadResume(req, res) {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    res.status(404).json({ error: 'Resume not found' });
    return null;
  }
  if (String(resume.userID) !== req.userId) {
    res.status(403).json({ error: 'You can only access your own resumes' });
    return null;
  }
  return resume;
}

// POST /api/users/:userId/resumes
exports.createResume = async (req, res, next) => {
  let storedName;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send a PDF in the "resume" field' });
    }
    // The first bytes of every real PDF are "%PDF-". The file name and
    // Content-Type header are set by the client, so they can't be trusted.
    if (req.file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    if ((await Resume.countDocuments({ userID: req.userId })) >= MAX_RESUMES) {
      return res.status(409).json({ error: `You can keep at most ${MAX_RESUMES} resumes. Delete one first` });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    storedName = `${crypto.randomUUID()}.pdf`;
    await fs.writeFile(path.join(UPLOAD_DIR, storedName), req.file.buffer);

    const resume = await Resume.create({
      userID: req.userId,
      originalName: cleanName(req.file.originalname),
      storedName,
      size: req.file.size
    });

    res.status(201).location(`/api/resumes/${resume._id}/file`).json(resume);
  } catch (err) {
    // If the database save failed, don't leave an orphan file on disk
    if (storedName) await fs.unlink(path.join(UPLOAD_DIR, storedName)).catch(() => {});
    next(err);
  }
};

// GET /api/users/:userId/resumes
exports.listResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userID: req.params.userId }).sort({ uploadedAt: -1 });
    res.status(200).json(resumes);
  } catch (err) {
    next(err);
  }
};

// GET /api/resumes/:id/file
exports.downloadResume = async (req, res, next) => {
  try {
    const resume = await loadResume(req, res);
    if (!resume) return;

    res.download(path.join(UPLOAD_DIR, resume.storedName), resume.originalName, (err) => {
      if (!err || res.headersSent) return;
      if (err.code === 'ENOENT') return res.status(404).json({ error: 'File not found on server' });
      next(err);
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resumes/:id
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await loadResume(req, res);
    if (!resume) return;

    await fs.unlink(path.join(UPLOAD_DIR, resume.storedName)).catch((err) => {
      if (err.code !== 'ENOENT') throw err;   // already gone is fine
    });
    await resume.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
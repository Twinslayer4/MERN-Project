const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { importJob, companyInfo } = require('../services/lookup');

router.use(requireAuth);

router.get('/company', async (req, res, next) => {
  try {
    if (!req.query.name) return res.status(400).json({ error: 'name is required' });
    const info = await companyInfo(String(req.query.name));
    if (!info) return res.status(404).json({ error: 'No description found' });
    res.status(200).json(info);
  } catch (err) {
    next(err);
  }
});

router.post('/job', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });
    res.status(200).json(await importJob(url));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

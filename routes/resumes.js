const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');
const resumes = require('../controllers/resumesController');

const router = express.Router();

router.param('id', validateObjectId);
router.use(requireAuth);

router.get('/:id/file', resumes.downloadResume);
router.delete('/:id', resumes.deleteResume);

module.exports = router;
const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');
const apps = require('../controllers/applicationsController');

const router = express.Router();

// Rejects malformed ids with a 400 before any handler runs
router.param('id', validateObjectId);

// Every route in this file requires a logged-in user
router.use(requireAuth);

// GET / PATCH / DELETE /api/applications/:id
router
  .route('/:id')
  .get(apps.getApplication)
  .patch(apps.updateApplication)
  .delete(apps.deleteApplication);

module.exports = router;
const express = require('express');
const users = require('../controllers/usersController');
const apps = require('../controllers/applicationsController');  
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth, requireSelf } = require('../middleware/auth');
const { requireSelfOrAdmin } = require('../middleware/requireSelfOrAdmin');

const router = express.Router();

// Runs before any route below that contains :userId
router.param('userId', validateObjectId);

// POST /api/users - Register a new user (open to everyone)
router.post('/', users.createUser);

// Everything below needs a logged-in user, and only their own account
// GET /api/users/:userId - Fetch one user
router.get('/:userId', requireAuth, requireSelf, users.getUser);

// GET  lists user's applications (the owner or an admin); POST creates one (owner only)
router
  .route('/:userId/applications')
  .get(requireAuth, requireSelfOrAdmin, apps.listApplications)
  .post(requireAuth, requireSelf, apps.createApplication);

module.exports = router;

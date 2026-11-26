const express = require('express');
const applications = require('../controllers/applicationsController');
const interviews = require('../controllers/interviewsController');
const users = require('../controllers/usersController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth, requireSelf } = require('../middleware/auth');

const router = express.Router();

// Runs before any route below that contains :userId
router.param('userId', validateObjectId);
router.param('interviewId', validateObjectId);

// POST /api/users - Register a new user (open to everyone)
router.post('/', users.createUser);

// Everything below needs a logged-in user, and only their own account
// GET /api/users/:userId - Fetch one user
router.get('/:userId', requireAuth, requireSelf, users.getUser);
router.route('/:userId/applications')
  .all(requireAuth, requireSelf)
  .get(applications.listApplications)
  .post(applications.createApplication);
router.route('/:userId/interviews')
  .all(requireAuth, requireSelf)
  .get(interviews.listInterviews)
  .post(interviews.createInterview);
router.route('/:userId/interviews/:interviewId')
  .all(requireAuth, requireSelf)
  .put(interviews.updateInterview)
  .delete(interviews.deleteInterview);
router.use('/:userId/resumes', requireAuth, requireSelf, require('./resumes'));

module.exports = router;

const router = require('express').Router();
const admin = require('../controllers/adminController');
const validateObjectId = require('../middleware/validateObjectId');
const { requireAuth } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.param('userId', validateObjectId);
router.use(requireAuth, requireAdmin);

router.get('/users', admin.listUsers);
router.get('/users/:userId', admin.getUser);
router.patch('/users/:userId/role', admin.updateRole);
router.delete('/users/:userId', admin.deleteUser);

module.exports = router;

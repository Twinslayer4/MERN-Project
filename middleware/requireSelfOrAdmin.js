const { User } = require('../models');

// Looks up user + returns true if their role is 'admin'.
// Token only holds user's id, so role comes from database.
exports.isAdmin = async (userId) => {
  const user = await User.findById(userId).select('role');
  return user?.role === 'admin';
};

// Like requireSelf, but admins are allowed through too.
// Must come AFTER requireAuth, which sets req.userId.
exports.requireSelfOrAdmin = async (req, res, next) => {
  try {
    if (req.params.userId === req.userId || (await exports.isAdmin(req.userId))) {
      return next();
    }
    return res.status(403).json({ error: 'You can only access your own applications' });
  } catch (err) {
    next(err);
  }
};
const { isAdmin } = require('./requireSelfOrAdmin');

module.exports = async (req, res, next) => {
  try {
    if (await isAdmin(req.userId)) return next();
    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    next(err);
  }
};

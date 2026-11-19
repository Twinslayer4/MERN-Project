const { User, Application } = require('../models');

exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filter = {};
    if (req.query.search) {
      const safe = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(safe, 'i');
      filter.$or = [{ login: re }, { email: re }, { firstName: re }, { lastName: re }];
    }
    const [users, total] = await Promise.all([
      User.find(filter).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter)
    ]);
    res.status(200).json({ users, total, page, limit });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: "role must be 'user' or 'admin'" });
    }
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Application.deleteMany({ userID: req.params.userId });
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  digest: { type: String, required: true, select: false },
  content: { type: Buffer, required: true, select: false }
}, { versionKey: false });

resumeSchema.index({ owner: 1, createdAt: -1 });
resumeSchema.index({ owner: 1, digest: 1 }, { unique: true });

module.exports = mongoose.model('Resume', resumeSchema);

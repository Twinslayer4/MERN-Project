const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  company: { type: String, required: true, trim: true, maxlength: 200 },
  role: { type: String, required: true, trim: true, maxlength: 200 },
  type: {
    type: String,
    required: true,
    enum: ['Recruiter screen', 'Technical interview', 'Behavioral interview', 'On-site interview', 'Final interview'],
  },
  startsAt: { type: Date, required: true },
}, { versionKey: false });

interviewSchema.index({ userID: 1, startsAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);

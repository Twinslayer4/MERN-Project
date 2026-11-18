const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userID: { type: String, required: [true, 'userID is required'], trim: true, index: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { collection: 'resume', versionKey: false }
);

// Never send the server-side file name to clients
resumeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.storedName;
    return ret;
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
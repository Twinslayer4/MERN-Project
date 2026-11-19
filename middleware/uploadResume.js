const multer = require('multer');

// Keep the upload in memory so we can check it is really a PDF
// BEFORE anything is written to disk. 5 MB limit, one file.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
}).single('resume');          // the form field must be named "resume"

// Wrapped so multer's errors become the same { error: "..." } JSON as the rest of the API
module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large (max 5 MB)' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    next(err);
  });
};
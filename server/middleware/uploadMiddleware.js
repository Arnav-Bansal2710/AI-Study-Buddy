const multer = require('multer');
const path = require('path');

// Where to save files and what to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // saves to server/uploads/
  },
  filename: (req, file, cb) => {
    // unique name: timestamp + original name
    // e.g. 1714000000000-notes.pdf
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    cb(null, true);  // accept
  } else {
    cb(new Error('Only PDF files are allowed'), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // max 10MB
});

module.exports = upload;
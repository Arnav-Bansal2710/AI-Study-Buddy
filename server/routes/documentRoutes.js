const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument
} = require('../controllers/documentController');

// Upload PDF (multer runs first, then controller)
router.post('/upload', protect, upload.single('pdf'), uploadDocument);

// Get all docs for a subject
router.get('/subject/:subjectId', protect, getDocuments);

// Get single doc
router.get('/:id', protect, getDocument);

// Delete doc
router.delete('/:id', protect, deleteDocument);

module.exports = router;
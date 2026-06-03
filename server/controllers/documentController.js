const db = require('../config/db');
const { summarize } = require('../config/ai');
const extractTextFromPDF = require('../utils/pdfParser');
const fs = require('fs');

const uploadDocument = async (req, res) => {
  const userId = req.user.id;
  const { subjectId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  if (!subjectId) {
    return res.status(400).json({ message: 'Subject ID is required' });
  }

  const filePath = req.file.path;
  console.log('Uploaded file path:', req.file.path);
  const filename = req.file.filename;

  try {
    // ── Step 1: Extract text ────────────────────────────
    console.log('📄 Extracting text from PDF...');
    const rawText = await extractTextFromPDF(filePath);

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from PDF.' });
    }

    const trimmedText = rawText.substring(0, 1024);

    // ── Step 2: Generate summary ────────────────────────
    console.log('🤖 Generating summary with AI...');
    const summary = await summarize(trimmedText); // ← throws if fails
    console.log('✅ Summary generated:', summary.substring(0, 100));

    // ── Step 3: Save to MySQL ───────────────────────────
    console.log('💾 Saving to database...');
    const [result] = await db.query(
      `INSERT INTO documents (subject_id, user_id, filename, raw_text, summary)
       VALUES (?, ?, ?, ?, ?)`,
      [subjectId, userId, filename, rawText, summary]
    );

    res.status(201).json({
      message: 'Document uploaded and summarized successfully!',
      document: { id: result.insertId, filename, summary }
    });

  } catch (err) {
    console.error('❌ Upload error:', err.message);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

// Get all documents for a subject
const getDocuments = async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.id;

  try {
    const [documents] = await db.query(
      `SELECT id, filename, summary, created_at 
       FROM documents 
       WHERE subject_id = ? AND user_id = ?
       ORDER BY created_at DESC`,
      [subjectId, userId]
    );

    res.json({ documents });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single document (with full raw text)
const getDocument = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [docs] = await db.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ document: docs[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Get filename first so we can delete the file too
    const [docs] = await db.query(
      'SELECT filename FROM documents WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from DB
    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    // Delete file from disk
    const path = require('path');

    const filePath = path.join(
      __dirname,
      '..',
      'uploads',
      docs[0].filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Document deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
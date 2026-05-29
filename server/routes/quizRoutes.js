const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createQuiz, getQuiz, submitQuiz, getAttempts } = require('../controllers/quizController');

router.post('/generate/:documentId',  protect, createQuiz);
router.get('/:documentId',            protect, getQuiz);
router.post('/submit/:documentId',    protect, submitQuiz);
router.get('/attempts/:documentId',   protect, getAttempts);

module.exports = router;
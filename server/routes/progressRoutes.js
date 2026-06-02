const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getOverallProgress,
  getSubjectProgress,
  getWeakTopics,
  getStreak,
  getSummaryStats
} = require('../controllers/progressController');

router.get('/overall',           protect, getOverallProgress);
router.get('/subject/:subjectId',protect, getSubjectProgress);
router.get('/weak-topics',       protect, getWeakTopics);
router.get('/streak',            protect, getStreak);
router.get('/stats',             protect, getSummaryStats);

module.exports = router;
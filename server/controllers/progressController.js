const db = require('../config/db');

// Get overall progress for all subjects
const getOverallProgress = async (req, res) => {
  const userId = req.user.id;

  try {
    const [data] = await db.query(
      `SELECT 
        s.id as subject_id,
        s.title as subject_title,
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(DISTINCT qa.id) as total_attempts,
        ROUND(AVG(qa.score / qa.total * 100)) as avg_score,
        MAX(qa.attempted_at) as last_attempted
       FROM subjects s
       LEFT JOIN documents d ON d.subject_id = s.id AND d.user_id = ?
       LEFT JOIN quiz_attempts qa ON qa.document_id = d.id AND qa.user_id = ?
       WHERE s.user_id = ?
       GROUP BY s.id, s.title
       ORDER BY s.created_at DESC`,
      [userId, userId, userId]
    );

    res.json({ progress: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress for a specific subject
const getSubjectProgress = async (req, res) => {
  const userId = req.user.id;
  const { subjectId } = req.params;

  try {
    // Get all documents in subject with their avg scores
    const [documents] = await db.query(
      `SELECT 
        d.id as document_id,
        d.filename,
        d.created_at,
        COUNT(qa.id) as attempts,
        ROUND(AVG(qa.score / qa.total * 100)) as avg_score,
        MAX(qa.score / qa.total * 100) as best_score,
        MIN(qa.score / qa.total * 100) as worst_score
       FROM documents d
       LEFT JOIN quiz_attempts qa ON qa.document_id = d.id
       WHERE d.subject_id = ? AND d.user_id = ?
       GROUP BY d.id, d.filename, d.created_at`,
      [subjectId, userId]
    );

    // Get score history over time for chart
    const [history] = await db.query(
      `SELECT 
        qa.score,
        qa.total,
        ROUND(qa.score / qa.total * 100) as percentage,
        qa.attempted_at,
        d.filename
       FROM quiz_attempts qa
       JOIN documents d ON d.id = qa.document_id
       WHERE d.subject_id = ? AND qa.user_id = ?
       ORDER BY qa.attempted_at ASC`,
      [subjectId, userId]
    );

    res.json({ documents, history });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get weak topics — documents where avg score < 60%
const getWeakTopics = async (req, res) => {
  const userId = req.user.id;

  try {
    const [weak] = await db.query(
      `SELECT 
        d.id as document_id,
        d.filename,
        s.title as subject_title,
        ROUND(AVG(qa.score / qa.total * 100)) as avg_score,
        COUNT(qa.id) as attempts
       FROM documents d
       JOIN subjects s ON s.id = d.subject_id
       JOIN quiz_attempts qa ON qa.document_id = d.id
       WHERE qa.user_id = ?
       GROUP BY d.id, d.filename, s.title
       HAVING avg_score < 60
       ORDER BY avg_score ASC`,
      [userId]
    );

    res.json({ weakTopics: weak });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get streak info
const getStreak = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get distinct days user attempted quizzes
    const [days] = await db.query(
      `SELECT DISTINCT DATE(attempted_at) as study_date
       FROM quiz_attempts
       WHERE user_id = ?
       ORDER BY study_date DESC`,
      [userId]
    );

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days.length; i++) {
      const studyDate = new Date(days[i].study_date);
      studyDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today - studyDate) / (1000 * 60 * 60 * 24));

      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }

    // Update streak in users table
    await db.query(
      'UPDATE users SET streak = ?, last_active = CURDATE() WHERE id = ?',
      [streak, userId]
    );

    res.json({ streak, totalStudyDays: days.length });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get total stats for dashboard summary
const getSummaryStats = async (req, res) => {
  const userId = req.user.id;

  try {
    const [[subjects]]  = await db.query('SELECT COUNT(*) as count FROM subjects WHERE user_id = ?', [userId]);
    const [[documents]] = await db.query('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', [userId]);
    const [[attempts]]  = await db.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = ?', [userId]);
    const [[avgScore]]  = await db.query(
      'SELECT ROUND(AVG(score/total*100)) as avg FROM quiz_attempts WHERE user_id = ?',
      [userId]
    );

    res.json({
      stats: {
        subjects:  subjects.count,
        documents: documents.count,
        attempts:  attempts.count,
        avgScore:  avgScore.avg || 0,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getOverallProgress,
  getSubjectProgress,
  getWeakTopics,
  getStreak,
  getSummaryStats
};
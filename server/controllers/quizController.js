const db = require('../config/db.js');
const {generateQuiz} = require('../config/ai.js');

const createQuiz = async(req,res)=>{
    const {documentId} = req.params;
    const userId = req.user.id;
    try{

        const [doc] = await db.query(
            'SELECT raw_text FROM documents WHERE id=? AND user_id=?',
            [documentId,userId]
        );

        if(doc.length == 0){
            return res.status(404).json({message:'donument is empty'});
        }

        const rawText = doc[0].raw_text;

        const [existing] = await db.query(
            'SELECT id FROM quizzes WHERE id=? AND user_id=?',
            [documentId,userId]
        );

        if(existing.length > 0){
            const [quiz] = await db.query(
                'SELECT * FORM quizzes WHERE id=? AND user_id=?',
                [documentId,userId]
            );
            return res.json({message:'Quiz already existed',quiz})
        }

        console.log('📝 Generating quiz...');
        const questions = await generateQuiz(rawText);

        // Save each question
        const insertPromises = questions.map(q =>
        db.query(
            `INSERT INTO quizzes 
            (document_id, user_id, question, option_a, option_b, option_c, option_d, correct_option)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [documentId, userId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
        )
        );
        await Promise.all(insertPromises);

        const [saved] = await db.query(
        'SELECT * FROM quizzes WHERE document_id = ? AND user_id = ?',
        [documentId, userId]
        );

        res.status(201).json({
        message: `${saved.length} quiz questions generated!`,
        questions: saved
        });

    } catch (err) {
        console.error('Quiz error:', err.message);
        res.status(500).json({ message: err.message || 'Failed to generate quiz' });
    }
};

    // Get quiz questions (without correct answers for attempt mode)
const getQuiz = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user.id;

    try {
        const [questions] = await db.query(
        `SELECT id, question, option_a, option_b, option_c, option_d
        FROM quizzes WHERE document_id = ? AND user_id = ?`,
        [documentId, userId]
            // ✅ correct_option intentionally excluded — shown only after submit
        );

        res.json({ questions });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const submitQuiz = async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;
  const { answers } = req.body;
  // answers = [{ questionId: 1, selected: "a" }, ...]

  try {
    // Get correct answers from DB
    const [questions] = await db.query(
      'SELECT id, correct_option FROM quizzes WHERE document_id = ? AND user_id = ?',
      [documentId, userId]
    );

    // Calculate score
    let score = 0;
    const results = questions.map(q => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      const isCorrect = userAnswer?.selected === q.correct_option;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        correct: q.correct_option,
        selected: userAnswer?.selected,
        isCorrect
      };
    });

    // Save attempt to DB
    await db.query(
      'INSERT INTO quiz_attempts (user_id, document_id, score, total) VALUES (?, ?, ?, ?)',
      [userId, documentId, score, questions.length]
    );

    res.json({
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get past quiz attempts
const getAttempts = async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;

  try {
    const [attempts] = await db.query(
      `SELECT score, total, 
       ROUND((score/total)*100) as percentage,
       attempted_at
       FROM quiz_attempts 
       WHERE document_id = ? AND user_id = ?
       ORDER BY attempted_at DESC`,
      [documentId, userId]
    );

    res.json({ attempts });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createQuiz, getQuiz, submitQuiz, getAttempts };

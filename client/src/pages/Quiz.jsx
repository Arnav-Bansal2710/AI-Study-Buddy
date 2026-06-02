import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateQuiz, getQuiz, submitQuiz } from '../services/api';

const Quiz = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState({});
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => { loadQuiz(); }, []);

  const loadQuiz = async () => {
    try {
      const res = await getQuiz(documentId);
      if (res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        const generated = await generateQuiz(documentId);
        setQuestions(generated.data.questions);
      }
    } catch (err) {
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, option) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      return alert('Please answer all questions before submitting!');
    }
    const formatted = Object.entries(answers).map(([questionId, selected]) => ({
      questionId: parseInt(questionId),
      selected
    }));
    setSubmitting(true);
    try {
      const res = await submitQuiz(documentId, formatted);
      setResult(res.data);
    } catch (err) {
      setError('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-[#6c63ff] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Generating quiz...</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-red-400 text-sm bg-red-50 px-5 py-3 rounded-xl">⚠️ {error}</p>
    </div>
  );

  // ── Result Screen ────────────────────────────────────
  if (result) {
    const { score, total, percentage, results } = result;

    const scoreColor =
      percentage >= 70 ? 'text-green-500' :
      percentage >= 40 ? 'text-orange-400' : 'text-red-400';

    const scoreBg =
      percentage >= 70 ? 'bg-green-50' :
      percentage >= 40 ? 'bg-orange-50' : 'bg-red-50';

    const remark =
      percentage >= 70 ? '🌟 Excellent work!' :
      percentage >= 40 ? '👍 Good effort, keep studying!' :
      '📚 Review the material and try again!';

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-lg fade-in">

          {/* Score Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quiz Complete! 🎉</h2>

            <div className={`inline-flex flex-col items-center ${scoreBg} rounded-2xl px-10 py-5 mb-3`}>
              <span className={`text-6xl font-bold ${scoreColor}`}>
                {score}/{total}
              </span>
              <span className={`text-2xl font-semibold ${scoreColor} mt-1`}>
                {percentage}%
              </span>
            </div>

            <p className="text-gray-500 text-sm">{remark}</p>
          </div>

          {/* Answer Review */}
          <div className="flex flex-col gap-2 mb-6">
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-left border-l-4
                  ${r.isCorrect
                    ? 'bg-green-50 border-green-400'
                    : 'bg-red-50 border-red-400'
                  }`}
              >
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {questions[i]?.question}
                </p>
                <p className={`text-xs font-medium
                  ${r.isCorrect ? 'text-green-600' : 'text-red-500'}`}
                >
                  {r.isCorrect
                    ? '✅ Correct'
                    : `❌ You chose: ${r.selected?.toUpperCase()} · Correct: ${r.correct?.toUpperCase()}`
                  }
                </p>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); setAnswers({}); }}
              className="flex-1 py-3 border border-[#6c63ff] text-[#6c63ff]
                         rounded-xl text-sm font-medium hover:bg-indigo-50 transition"
            >
              Retry Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-xl text-sm font-medium transition"
            >
              Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  const allAnswered = Object.keys(answers).length === questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between
                      items-center sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="text-[#6c63ff] text-sm font-medium hover:opacity-70 transition"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-gray-800">📝 Quiz</h2>
        <span className="text-sm text-gray-400 font-medium">
          {answeredCount}/{questions.length} answered
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-5 py-6 fade-in">

        {/* ── Progress Bar ── */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-[#6c63ff] h-2 rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* ── Questions ── */}
        <div className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              {/* Question Number */}
              <p className="text-xs font-bold tracking-widest text-gray-300 mb-2">
                QUESTION {index + 1}
              </p>

              {/* Question Text */}
              <p className="text-base font-medium text-gray-800 leading-relaxed mb-4">
                {q.question}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(q.id, opt)}
                    className={`w-full px-4 py-3 border rounded-xl text-left text-sm
                                transition-all duration-150 flex items-center gap-3
                      ${answers[q.id] === opt
                        ? 'bg-[#6c63ff] border-[#6c63ff] text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[#6c63ff] hover:bg-indigo-50'
                      }`}
                  >
                    {/* Option Letter Badge */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center
                                      text-xs font-bold shrink-0
                      ${answers[q.id] === opt
                        ? 'bg-white/30 text-white'
                        : 'bg-gray-100 text-gray-500'
                      }`}>
                      {opt.toUpperCase()}
                    </span>
                    {q[`option_${opt}`]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Submit Button ── */}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="w-full mt-4 py-4 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                     rounded-2xl text-base font-semibold transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            `Submit Quiz 🚀 ${!allAnswered ? `(${questions.length - answeredCount} left)` : ''}`
          )}
        </button>

        <p className="text-center text-xs text-gray-300 mt-3">
          Answer all questions to enable submit
        </p>

      </div>
    </div>
  );
};

export default Quiz;
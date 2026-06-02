import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  getSummaryStats,
  getOverallProgress,
  getWeakTopics,
  getStreak
} from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Progress = () => {
  const navigate = useNavigate();
  const [stats,    setStats]    = useState(null);
  const [progress, setProgress] = useState([]);
  const [weak,     setWeak]     = useState([]);
  const [streak,   setStreak]   = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [statsRes, progressRes, weakRes, streakRes] = await Promise.all([
        getSummaryStats(),
        getOverallProgress(),
        getWeakTopics(),
        getStreak(),
      ]);
      setStats(statsRes.data.stats);
      setProgress(progressRes.data.progress);
      setWeak(weakRes.data.weakTopics);
      setStreak(streakRes.data.streak);
    } catch (err) {
      console.error('Progress load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-[#6c63ff] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading progress...</p>
    </div>
  );

  // ── Chart Data ───────────────────────────────────────
  const filteredProgress = progress.filter(p => p.avg_score !== null);

  const chartData = {
    labels: filteredProgress.map(p =>
      p.subject_title.length > 10
        ? p.subject_title.substring(0, 10) + '...'
        : p.subject_title
    ),
    datasets: [{
      label: 'Avg Score %',
      data: filteredProgress.map(p => p.avg_score || 0),
      backgroundColor: '#6c63ff',
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, ticks: { callback: val => `${val}%` } }
    }
  };

  // ── Score color helpers ──────────────────────────────
  const scoreColor = (score) =>
    score >= 70 ? 'text-green-500' :
    score >= 40 ? 'text-orange-400' : 'text-red-400';

  const scoreBg = (score) =>
    score >= 70 ? 'bg-green-50' :
    score >= 40 ? 'bg-orange-50' : 'bg-red-50';

  const barColor = (score) =>
    score >= 70 ? 'bg-green-400' :
    score >= 40 ? 'bg-orange-400' : 'bg-red-400';

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between
                      items-center sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#6c63ff] text-sm font-medium hover:opacity-70 transition"
        >
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-gray-800">📊 My Progress</h2>
        <div />
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-6 fade-in flex flex-col gap-4">

        {/* ── Streak Banner ── */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl
                        p-5 flex items-center gap-4 text-white shadow-sm">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-xl font-bold leading-none">{streak} Day Streak</p>
            <p className="text-orange-100 text-sm mt-1">
              Keep studying daily to maintain your streak!
            </p>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">

            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#6c63ff] mb-1">{stats.subjects}</p>
              <p className="text-xs text-gray-400">Subjects</p>
            </div>

            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#6c63ff] mb-1">{stats.documents}</p>
              <p className="text-xs text-gray-400">Notes Uploaded</p>
            </div>

            <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
              <p className="text-3xl font-bold text-[#6c63ff] mb-1">{stats.attempts}</p>
              <p className="text-xs text-gray-400">Quizzes Taken</p>
            </div>

            <div className={`rounded-2xl p-5 text-center shadow-sm ${scoreBg(stats.avgScore)}`}>
              <p className={`text-3xl font-bold mb-1 ${scoreColor(stats.avgScore)}`}>
                {stats.avgScore || 0}%
              </p>
              <p className="text-xs text-gray-400">Avg Score</p>
            </div>

          </div>
        )}

        {/* ── Bar Chart ── */}
        {filteredProgress.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">📈 Score by Subject</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {/* ── Subject Breakdown ── */}
        {progress.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">📚 Subject Breakdown</h3>

            <div className="flex flex-col divide-y divide-gray-100">
              {progress.map(p => (
                <div key={p.subject_id}
                     className="flex justify-between items-center py-3">

                  {/* Subject Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{p.subject_title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.total_documents} notes · {p.total_attempts} attempts
                    </p>
                  </div>

                  {/* Score Bar */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${barColor(p.avg_score)}`}
                        style={{ width: `${p.avg_score || 0}%` }}
                      />
                    </div>
                    <p className={`text-sm font-semibold w-14 text-right
                      ${p.avg_score ? scoreColor(p.avg_score) : 'text-gray-300'}`}>
                      {p.avg_score ? `${p.avg_score}%` : 'No data'}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Weak Topics ── */}
        {weak.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-1">⚠️ Weak Topics</h3>
            <p className="text-xs text-gray-400 mb-4">
              Topics below 60% — focus here!
            </p>

            <div className="flex flex-col gap-3">
              {weak.map(w => (
                <div
                  key={w.document_id}
                  className="flex justify-between items-center bg-red-50
                             border border-red-100 rounded-xl p-4"
                >
                  {/* Topic Info */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 capitalize mb-1">
                      {w.filename.replace('.pdf', '').replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400">📚 {w.subject_title}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {w.attempts} attempt{w.attempts > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Score + Button */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-2xl font-bold text-red-400">{w.avg_score}%</p>
                    <button
                      onClick={() => navigate(`/quiz/${w.document_id}`)}
                      className="px-3 py-1.5 bg-red-400 hover:bg-red-500 text-white
                                 rounded-lg text-xs font-medium transition"
                    >
                      Retry Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty State ── */}
        {progress.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              No progress data yet
            </p>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Upload study notes and take quizzes<br />to see your progress tracked here
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-xl text-sm font-medium transition"
            >
              Upload Notes
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Progress;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getSummaryStats, getStreak } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [streak,  setStreak]  = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [s, st] = await Promise.all([getSummaryStats(), getStreak()]);
      setStats(s.data.stats);
      setStreak(st.data.streak);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const menu = [
    { path:'/upload',       icon:'📄', label:'Upload Notes',  desc:'Add new study material' },
    { path:'/subjects',     icon:'📚', label:'My Subjects',    desc:'View uploaded notes'   },
    { path:'/progress',     icon:'📊', label:'My Progress',   desc:'Track performance'      },
  ];

  const statCards = stats ? [
    { label:'Subjects',    value: stats.subjects,             color:'text-[#6c63ff]' },
    { label:'Notes',       value: stats.documents,            color:'text-[#6c63ff]' },
    { label:'Quizzes',     value: stats.attempts,             color:'text-[#6c63ff]' },
    { label:'Avg Score',   value: `${stats.avgScore || 0}%`,
      color: stats.avgScore >= 70 ? 'text-green-500' : stats.avgScore >= 40 ? 'text-orange-400' : 'text-red-400'
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Navbar ── */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2 text-lg font-bold">
          <span>🧠</span>
          <span className="text-gray-800">AI Study Buddy</span>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm font-medium
                     hover:bg-red-100 transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-6 fade-in">

        {/* ── Welcome Banner ── */}
        <div className="bg-gradient-to-r from-[#6c63ff] to-purple-400 rounded-2xl
                        p-6 text-white flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-semibold mb-1">Hello, {user?.name}! 👋</h2>
            <p className="text-purple-100 text-sm">Ready to study smarter today?</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-3 bg-white/20 rounded-xl px-4 py-3">
              <span className="text-3xl">🔥</span>
              <div className="text-center">
                <p className="text-2xl font-bold leading-none">{streak}</p>
                <p className="text-xs text-purple-100 mt-1">day streak</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        {!loading && stats && (
          <div className="grid grid-cols-4 gap-3 mb-5">
            {statCards.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Menu ── */}
        <div className="flex flex-col gap-3">
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-xl px-5 py-4 flex items-center gap-4
                         shadow-sm hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 no-underline"
            >
              <span className="text-3xl w-10 text-center">{item.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 mb-0.5">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <span className="text-gray-300 text-lg">→</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
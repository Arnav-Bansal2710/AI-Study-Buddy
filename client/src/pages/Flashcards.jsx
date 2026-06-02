import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateFlashcards, getFlashcards } from "../services/api.js";

const Flashcards = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [flashcards,    setFlashcards]    = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [flipped,       setFlipped]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  useEffect(() => { loadFlashcards(); }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const res = await getFlashcards(documentId);
      if (res.data.flashcards.length > 0) {
        setFlashcards(res.data.flashcards);
      } else {
        const generated = await generateFlashcards(documentId);
        setFlashcards(generated.data.flashcards);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex(i => Math.min(i + 1, flashcards.length - 1)), 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex(i => Math.max(i - 1, 0)), 150);
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-3">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-[#6c63ff] rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Generating flashcards...</p>
    </div>
  );

  // ── Error ────────────────────────────────────────────
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-red-400 text-sm bg-red-50 px-5 py-3 rounded-xl">⚠️ {error}</p>
    </div>
  );

  // ── Empty ────────────────────────────────────────────
  if (flashcards.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-gray-400">No flashcards found</p>
    </div>
  );

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

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
        <h2 className="text-lg font-semibold text-gray-800">🃏 Flashcards</h2>
        <span className="text-sm text-gray-400 font-medium">
          {currentIndex + 1} / {flashcards.length}
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-5 py-6 fade-in">

        {/* ── Progress Bar ── */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-[#6c63ff] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Flashcard ── */}
        <div
          onClick={() => setFlipped(!flipped)}
          className="bg-white rounded-2xl p-10 min-h-56 flex flex-col
                     items-center justify-center text-center cursor-pointer
                     shadow-md hover:shadow-lg transition-shadow duration-200 mb-6"
        >
          {!flipped ? (
            <>
              <span className="text-xs font-bold tracking-widest text-gray-300 mb-4">
                QUESTION
              </span>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {card.question}
              </p>
              <p className="text-xs text-gray-300 mt-6">Tap to reveal answer 👆</p>
            </>
          ) : (
            <>
              <span className="text-xs font-bold tracking-widest text-[#6c63ff] mb-4">
                ANSWER
              </span>
              <p className="text-lg text-gray-800 leading-relaxed font-medium">
                {card.answer}
              </p>
              <p className="text-xs text-gray-300 mt-6">Tap to see question 👆</p>
            </>
          )}
        </div>

        {/* ── Dot Indicators ── */}
        <div className="flex justify-center gap-1.5 mb-6">
          {flashcards.map((_, i) => (
            <div
              key={i}
              onClick={() => { setFlipped(false); setCurrentIndex(i); }}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300
                ${i === currentIndex
                  ? 'bg-[#6c63ff] w-5'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
            />
          ))}
        </div>

        {/* ── Navigation Buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm
                       font-medium text-gray-600 bg-white hover:bg-gray-50
                       transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentIndex === flashcards.length - 1 ? (
            <button
              onClick={() => navigate(`/quiz/${documentId}`)}
              className="flex-1 py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-xl text-sm font-medium transition"
            >
              Take Quiz →
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm
                         font-medium text-gray-600 bg-white hover:bg-gray-50 transition"
            >
              Next →
            </button>
          )}
        </div>

        {/* ── Keyboard hint ── */}
        <p className="text-center text-xs text-gray-300 mt-4">
          Click card to flip · Navigate with buttons
        </p>

      </div>
    </div>
  );
};

export default Flashcards;
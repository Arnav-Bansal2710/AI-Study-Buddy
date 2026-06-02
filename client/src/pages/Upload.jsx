import { useState, useEffect } from 'react';
import { createSubject, getSubjects, uploadDocument } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();
  const [subjects,        setSubjects]        = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubject,      setNewSubject]      = useState('');
  const [file,            setFile]            = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [summary,         setSummary]         = useState('');
  const [error,           setError]           = useState('');
  const [message,         setMessage]         = useState('');
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data.subjects);
    } catch (err) { console.error(err); }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.trim()) return;
    try {
      await createSubject({ title: newSubject });
      setNewSubject('');
      fetchSubjects();
    } catch (err) { setError('Failed to create subject'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); setSummary(''); setMessage('');
    if (!file)            return setError('Please select a PDF');
    if (!selectedSubject) return setError('Please select a subject');

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subjectId', selectedSubject);

    setLoading(true);
    setMessage('📄 Extracting text...');
    try {
      setTimeout(() => setMessage('🤖 Generating AI summary...'), 1500);
      const res = await uploadDocument(formData);
      setSummary(res.data.document.summary);
      setDocumentId(res.data.document.id);
      setMessage('');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setMessage('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#6c63ff] text-sm font-medium hover:opacity-70 transition"
        >
          ← Dashboard
        </button>
        <h2 className="text-lg font-semibold text-gray-800">📄 Upload Notes</h2>
      </nav>

      <div className="max-w-xl mx-auto px-5 py-6 fade-in flex flex-col gap-4">

        {/* Subject Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Step 1 — Select a Subject
          </h3>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Data Structures, Physics..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSubject()}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:border-[#6c63ff] focus:ring-2
                         focus:ring-[#6c63ff]/20 transition"
            />
            <button
              onClick={handleCreateSubject}
              className="px-5 py-2.5 bg-[#6c63ff] text-white rounded-lg text-sm
                         font-medium hover:bg-[#5a52d5] transition whitespace-nowrap"
            >
              + Add
            </button>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:border-[#6c63ff] transition text-gray-700"
          >
            <option value="">-- Select a subject --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Step 2 — Upload Your PDF</h3>

          <form onSubmit={handleUpload}>
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8
                              text-center hover:border-[#6c63ff] transition-colors">
                {file ? (
                  <>
                    <div className="text-4xl mb-2">📎</div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-500 text-sm">Click to choose a PDF file</p>
                    <p className="text-gray-300 text-xs mt-1">Max 10MB · PDF only</p>
                  </>
                )}
              </div>
            </label>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mt-3">
                ⚠️ {error}
              </p>
            )}

            {message && (
              <div className="flex items-center gap-3 bg-indigo-50 text-[#6c63ff]
                              text-sm p-3 rounded-lg mt-3">
                <div className="w-4 h-4 border-2 border-[#6c63ff]/30 border-t-[#6c63ff]
                                rounded-full animate-spin" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-lg font-medium transition disabled:opacity-60
                         disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : '🤖 Upload & Generate Summary'}
            </button>
          </form>
        </div>

        {/* Summary Result */}
        {summary && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-indigo-100 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="font-semibold text-gray-800">AI Generated Summary</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{summary}</p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/flashcards/${documentId}`)}
                className="flex-1 py-3 bg-indigo-50 text-[#6c63ff] rounded-lg
                           font-medium text-sm hover:bg-indigo-100 transition"
              >
                🃏 Flashcards
              </button>
              <button
                onClick={() => navigate(`/quiz/${documentId}`)}
                className="flex-1 py-3 bg-[#6c63ff] text-white rounded-lg
                           font-medium text-sm hover:bg-[#5a52d5] transition"
              >
                📝 Take Quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Upload;
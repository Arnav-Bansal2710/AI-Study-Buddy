import { useState, useEffect } from 'react';
import { createSubject, getSubjects, uploadDocument } from '../services/api';

const Upload = () => {
  const [subjects, setSubjects]         = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [file, setFile]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [summary, setSummary]           = useState('');
  const [error, setError]               = useState('');
  const [message, setMessage]           = useState('');

  // Load subjects on page load
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data.subjects);
    } catch (err) {
      console.error('Failed to load subjects');
    }
  };

  // Create a new subject
  const handleCreateSubject = async () => {
    if (!newSubjectTitle.trim()) return;
    try {
      await createSubject({ title: newSubjectTitle });
      setNewSubjectTitle('');
      fetchSubjects(); // refresh list
    } catch (err) {
      setError('Failed to create subject');
    }
  };

  // Handle PDF upload
  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSummary('');

    if (!file) {
      return setError('Please select a PDF file');
    }
    if (!selectedSubject) {
      return setError('Please select a subject');
    }

    // ⚠️ For file uploads you MUST use FormData, not JSON
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subjectId', selectedSubject);

    setLoading(true);
    setMessage('Uploading and extracting text... ⏳');

    try {
      const res = await uploadDocument(formData);
      setSummary(res.data.document.summary);
      setMessage('✅ Upload successful! Here is your AI summary:');
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📄 Upload Study Notes</h2>

        {/* ── Create Subject Section ── */}
        <div style={styles.section}>
          <h4>Step 1 — Create or Select a Subject</h4>
          <div style={styles.row}>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Data Structures, Physics..."
              value={newSubjectTitle}
              onChange={(e) => setNewSubjectTitle(e.target.value)}
            />
            <button style={styles.smallBtn} onClick={handleCreateSubject}>
              + Add
            </button>
          </div>

          <select
            style={styles.select}
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Select a subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* ── Upload Section ── */}
        <div style={styles.section}>
          <h4>Step 2 — Upload Your PDF</h4>
          <form onSubmit={handleUpload}>
            <input
              style={styles.fileInput}
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && <p style={styles.fileName}>📎 {file.name}</p>}

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? 'Processing... 🤖' : 'Upload & Generate Summary'}
            </button>
          </form>
        </div>

        {/* ── Messages ── */}
        {error   && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        {/* ── AI Summary Result ── */}
        {summary && (
          <div style={styles.summaryBox}>
            <h4>🤖 AI Generated Summary:</h4>
            <p style={styles.summaryText}>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:   { display:'flex', justifyContent:'center', padding:'40px 20px', backgroundColor:'#f0f4f8', minHeight:'100vh' },
  card:        { background:'white', padding:'40px', borderRadius:'12px', width:'100%', maxWidth:'560px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  title:       { color:'#6c63ff', marginBottom:'24px' },
  section:     { marginBottom:'28px' },
  row:         { display:'flex', gap:'8px', marginBottom:'10px' },
  input:       { flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' },
  smallBtn:    { padding:'10px 16px', backgroundColor:'#6c63ff', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' },
  select:      { width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px' },
  fileInput:   { width:'100%', padding:'10px 0', fontSize:'14px' },
  fileName:    { fontSize:'13px', color:'#666', margin:'6px 0' },
  button:      { width:'100%', padding:'12px', marginTop:'12px', backgroundColor:'#6c63ff', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  error:       { color:'red', fontSize:'14px', backgroundColor:'#fff0f0', padding:'10px', borderRadius:'6px' },
  message:     { color:'#444', fontSize:'14px', backgroundColor:'#f0f4ff', padding:'10px', borderRadius:'6px' },
  summaryBox:  { backgroundColor:'#f8f8ff', border:'1px solid #ddd', borderRadius:'10px', padding:'20px', marginTop:'16px' },
  summaryText: { fontSize:'14px', lineHeight:'1.7', color:'#333' },
};

export default Upload;
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocuments } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Documents = () => {
  const { subjectId } = useParams();

  const [documents, setDocuments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await getDocuments(subjectId);
      setDocuments(res.data.documents);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h2 className="text-2xl font-bold mb-5">📄 Notes</h2>

      {documents.map(doc => (
        <div
          key={doc.id}
          className="bg-white rounded-xl shadow p-4 mb-3"
        >
          <h3 className="font-semibold">
            {doc.filename}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            {doc.summary?.substring(0, 150)}...
          </p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(`/flashcards/${doc.id}`)}
              className="px-4 py-2 bg-indigo-100 rounded"
            >
              🃏 Flashcards
            </button>

            <button
              onClick={() => navigate(`/quiz/${doc.id}`)}
              className="px-4 py-2 bg-indigo-500 text-white rounded"
            >
              📝 Quiz
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Documents;
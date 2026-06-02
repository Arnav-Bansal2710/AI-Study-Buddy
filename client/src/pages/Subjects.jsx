import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h2 className="text-2xl font-bold mb-5">📚 Subjects</h2>

      {subjects.map(subject => (
        <div
          key={subject.id}
          onClick={() => navigate(`/subjects/${subject.id}`)}
          className="bg-white p-4 rounded-xl shadow cursor-pointer mb-3"
        >
          {subject.title}
        </div>
      ))}
    </div>
  );
};

export default Subjects;
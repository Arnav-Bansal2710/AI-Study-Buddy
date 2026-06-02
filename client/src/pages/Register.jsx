import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [success, setSuccess] = useState('');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await register(form.name, form.email, form.password);
    if (ok) {
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  const fields = [
    { name:'name',     label:'Full Name', type:'text',     placeholder:'John Doe' },
    { name:'email',    label:'Email',     type:'email',    placeholder:'your@email.com' },
    { name:'password', label:'Password',  type:'password', placeholder:'Min 6 characters' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md fade-in">

        <div className="text-center mb-7">
          <div className="text-5xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-[#6c63ff]">AI Study Buddy</h1>
          <p className="text-gray-400 text-sm mt-1">Join thousands of students studying smarter</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Create your account</h2>
          <p className="text-gray-400 text-sm mb-5">Free forever — no credit card needed</p>

          {error   && <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">⚠️ {error}</div>}
          {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">✅ {success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:border-[#6c63ff]
                             focus:ring-2 focus:ring-[#6c63ff]/20 transition"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6c63ff] hover:bg-[#5a52d5] text-white
                         rounded-lg font-medium transition duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6c63ff] font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
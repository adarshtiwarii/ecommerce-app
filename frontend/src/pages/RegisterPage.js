import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const ok = await register(formData);
    if (ok) navigate('/login');
    else setError('Registration failed');
  };

  return (
    <div className="bg-cinematic-dark min-h-screen flex items-center justify-center py-8">
      <div className="bg-cinematic-card rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-cinematic-text text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-900/30 border border-red-500 text-red-300 p-2 rounded mb-4 text-sm font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number (10 digits)"
            value={formData.phoneNumber}
            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
            required
          />
          <select
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cinematic-accent"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cinematic-accent"
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-cinematic-accent hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-cinematic-accent hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
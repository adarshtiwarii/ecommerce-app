import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await register(formData);
      if (result?.success) navigate('/login');
      else setError(result?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-orange-100 bg-white px-4 py-3 pl-11 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';
  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-orange-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200">
          <FiShoppingBag size={26} />
        </div>
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-black text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-500">Start shopping EcoMart deals with a secure account.</p>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiUser size={16} className={iconClass} />
            <input type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass} required />
          </div>
          <div className="relative">
            <FiMail size={16} className={iconClass} />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} required />
          </div>
          <div className="relative">
            <FiPhone size={16} className={iconClass} />
            <input type="tel" placeholder="Phone Number (10 digits)" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={inputClass} required />
          </div>
          <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" required>
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <div className="relative">
            <FiLock size={16} className={iconClass} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 characters)" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={`${inputClass} pr-11`} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-orange-500">
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <div className="relative">
            <FiLock size={16} className={iconClass} />
            <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className={`${inputClass} pr-11`} required />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-orange-500">
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-black text-orange-600 transition hover:text-orange-700 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

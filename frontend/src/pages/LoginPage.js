// src/pages/LoginPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { login, register } = useApp();
  const navigate = useNavigate();

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (mode === 'register') {
      if (!formData.name.trim()) return 'Full name is required';
      if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) return 'Enter a valid 10-digit phone number';
      if (!formData.gender) return 'Please select your gender';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password);
        if (result.success) navigate('/');
        else setError(result.message || 'Invalid email or password');
      } else {
        const result = await register({
          fullName: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });

        if (result.success) {
          setSuccess('Account created. Please login.');
          setFormData(prev => ({
            ...prev,
            name: '',
            phoneNumber: '',
            gender: '',
            password: '',
            confirmPassword: '',
          }));
          setTimeout(() => {
            setMode('login');
            setSuccess('');
          }, 1500);
        } else {
          setError(result.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const inputClass = 'w-full rounded-2xl border border-white/[0.08] bg-[#161616] px-4 py-3 pl-11 text-sm text-white shadow-sm outline-none transition placeholder:text-white/40 focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]';
  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]';

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-2xl bg-[#161616]/95 p-6 sm:p-8 shadow-2xl border border-white/[0.08] backdrop-blur">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B00] text-white shadow-lg shadow-orange-950/30">
          <FiShoppingBag size={26} />
        </div>
        <div className="text-center mb-7">
          <h1 className="text-3xl font-black text-white">{mode === 'login' ? 'Welcome Back' : 'Join EcoMart'}</h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === 'login' ? 'Sign in to manage orders, carts, and deals.' : 'Create your marketplace account in seconds.'}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[rgba(255,107,0,0.12)] p-1">
          {[
            { value: 'login', label: 'Login' },
            { value: 'register', label: 'Register' },
          ].map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchMode(tab.value)}
              className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${
                mode === tab.value
                  ? 'bg-[#161616] text-[#FF6B00] shadow-sm'
                  : 'text-white/50 hover:text-[#FF6B00]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <FiCheck size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <FiUser size={16} className={iconClass} />
                <input type="text" placeholder="Full Name *" value={formData.name} onChange={e => update('name', e.target.value)} className={inputClass} required />
              </div>
              <div className="relative">
                <FiPhone size={16} className={iconClass} />
                <input type="tel" placeholder="Phone Number (10 digits) *" value={formData.phoneNumber} onChange={e => update('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputClass} required />
              </div>
              <select value={formData.gender} onChange={e => update('gender', e.target.value)} className="w-full rounded-2xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]" required>
                <option value="">Select Gender *</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </>
          )}

          <div className="relative">
            <FiMail size={16} className={iconClass} />
            <input type="email" placeholder="Email Address *" value={formData.email} onChange={e => update('email', e.target.value)} className={inputClass} required />
          </div>

          <div className="relative">
            <FiLock size={16} className={iconClass} />
            <input type={showPassword ? 'text' : 'password'} placeholder="Password *" value={formData.password} onChange={e => update('password', e.target.value)} className={`${inputClass} pr-11`} required />
            <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF6B00]">
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="relative">
              <FiLock size={16} className={iconClass} />
              <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password *" value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className={`${inputClass} pr-11 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`} required />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF6B00]">
                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-bold text-[#FF6B00] transition hover:text-orange-700 hover:underline">Forgot Password?</Link>
            </div>
          )}

          <p className="text-xs leading-relaxed text-white/50">
            By continuing, you agree to EcoMart's <Link to="#" className="font-bold text-[#FF6B00] hover:underline">Terms of Use</Link> and <Link to="#" className="font-bold text-[#FF6B00] hover:underline">Privacy Policy</Link>.
          </p>

          <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B00] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-[#E55A00] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {loading ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-white/50">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="font-black text-[#FF6B00] transition hover:text-orange-700 hover:underline">
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;




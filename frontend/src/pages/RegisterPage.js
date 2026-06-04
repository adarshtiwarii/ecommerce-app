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

  // FIX: Added style={{ paddingLeft: '2.75rem' }} to all inputs with icons.
  // Problem: index.css global rule "input { padding: 12px 14px }" was
  // overriding Tailwind's pl-11 class, causing icons to overlap placeholder text.
  // Inline style has higher CSS specificity so it always wins over global CSS.
  // No other changes — colors, layout, fonts all exactly the same as before.

  const inputBase = 'w-full rounded-2xl border border-white/[0.08] bg-[#161616] py-3 pr-4 text-sm text-white shadow-sm outline-none transition placeholder:text-white/40 focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]';

  // Inline style for inputs that have a left icon — ensures text never overlaps icon
  const withIconStyle = { paddingLeft: '2.75rem' }; // = pl-11 = 44px

  // Inline style for inputs that also have a right icon (eye toggle)
  const withBothIconsStyle = { paddingLeft: '2.75rem', paddingRight: '2.75rem' };

  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]';

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#161616]/95 p-6 shadow-2xl backdrop-blur sm:p-8">

        {/* Icon badge — no change */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B00] text-white shadow-lg shadow-orange-950/30">
          <FiShoppingBag size={26} />
        </div>

        {/* Heading — no change */}
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-black text-white">Create Account</h2>
          <p className="mt-2 text-sm text-white/50">Start shopping EcoMart deals with a secure account.</p>
        </div>

        {/* Error message — no change */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="relative">
            <FiUser size={16} className={iconClass} />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              className={inputBase}
              style={withIconStyle}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail size={16} className={iconClass} />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={inputBase}
              style={withIconStyle}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <FiPhone size={16} className={iconClass} />
            <input
              type="tel"
              placeholder="Phone Number (10 digits)"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className={inputBase}
              style={withIconStyle}
              required
            />
          </div>

          {/* Gender select — no icon so no padding fix needed */}
          <select
            value={formData.gender}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            className="w-full rounded-2xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Password — has left icon AND right eye toggle */}
          <div className="relative">
            <FiLock size={16} className={iconClass} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className={inputBase}
              style={withBothIconsStyle}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF6B00]"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Confirm Password — has left icon AND right eye toggle */}
          <div className="relative">
            <FiLock size={16} className={iconClass} />
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={inputBase}
              style={withBothIconsStyle}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF6B00]"
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {/* Register button — no change */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B00] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-[#E55A00] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Login link — no change */}
        <p className="mt-5 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-[#FF6B00] transition hover:text-orange-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

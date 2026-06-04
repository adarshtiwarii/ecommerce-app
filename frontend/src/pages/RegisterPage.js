import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

// ─── Validation helpers ───────────────────────────────────────────────────────

// Full name: only letters, spaces, dots, hyphens — no numbers or special chars
const isValidFullName = (name) => /^[A-Za-z\s.\-']{2,50}$/.test(name.trim());

// Basic RFC-compliant email check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Password strength rules — each returns true if the rule passes
const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',        test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'At least one number',           test: (p) => /\d/.test(p) },
  { id: 'special', label: 'At least one special character (@$!%*?&#)', test: (p) => /[@$!%*?&#]/.test(p) },
];

// Returns 0–5 based on how many rules pass
const getPasswordStrength = (password) => passwordRules.filter((r) => r.test(password)).length;

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

// ─── PasswordStrengthPopup ────────────────────────────────────────────────────

/**
 * Floating popup that shows live password strength and which rules pass/fail.
 * Renders only when the password field is focused and has at least 1 character.
 */
const PasswordStrengthPopup = ({ password, visible }) => {
  const strength = getPasswordStrength(password);

  if (!visible || password.length === 0) return null;

  return (
    <div
      className="absolute left-0 z-50 mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#1e1e1e] p-4 shadow-2xl"
      style={{ top: '100%' }}
    >
      {/* Strength bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/50">Password Strength</span>
          <span className="text-xs font-bold" style={{ color: strengthColors[strength] }}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: level <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Individual rule checklist */}
      <ul className="space-y-1.5">
        {passwordRules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-2 text-xs">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black"
                style={{
                  backgroundColor: passed ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                  color: passed ? '#22c55e' : 'rgba(255,255,255,0.3)',
                }}
              >
                {passed ? '✓' : '×'}
              </span>
              <span style={{ color: passed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ─── RegisterPage ─────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  // Per-field inline validation error messages
  const [fieldErrors, setFieldErrors] = useState({});

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Controls visibility of the password strength popup
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { register } = useApp();
  const navigate = useNavigate();

  // ── Per-field validators called on blur ──────────────────────────────────

  const validateField = (name, value) => {
    let msg = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          msg = 'Full name is required.';
        } else if (!isValidFullName(value)) {
          msg = 'Name must be 2–50 characters and contain only letters, spaces, or hyphens.';
        }
        break;

      case 'email':
        if (!value.trim()) {
          msg = 'Email is required.';
        } else if (!isValidEmail(value)) {
          msg = 'Please enter a valid email address (e.g. user@example.com).';
        }
        break;

      case 'phoneNumber':
        if (!value) {
          msg = 'Phone number is required.';
        } else if (value.length !== 10) {
          msg = 'Phone number must be exactly 10 digits.';
        }
        break;

      case 'password':
        if (!value) {
          msg = 'Password is required.';
        } else if (getPasswordStrength(value) < 5) {
          msg = 'Password does not meet all requirements.';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          msg = 'Please confirm your password.';
        } else if (value !== formData.password) {
          msg = 'Passwords do not match.';
        }
        break;

      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  // ── Change handler: update value, clear error while typing ───────────────

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user starts correcting it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Submit: validate all fields before calling register() ────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Run all validators and collect results
    const checks = [
      validateField('fullName', formData.fullName),
      validateField('email', formData.email),
      validateField('phoneNumber', formData.phoneNumber),
      validateField('password', formData.password),
      validateField('confirmPassword', formData.confirmPassword),
    ];

    // Stop if any field is invalid
    if (checks.includes(false)) return;

    setLoading(true);
    try {
      const result = await register(formData);

      if (result?.success) {
        navigate('/login');
      } else {
        // Handle backend-reported duplicate phone number gracefully
        const msg = result?.message || '';
        if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('mobile')) {
          setFieldErrors((prev) => ({
            ...prev,
            phoneNumber: 'This phone number is already registered. Please use a different number.',
          }));
        } else {
          setError(msg || 'Registration failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared style constants (unchanged from original) ─────────────────────

  const inputBase =
    'w-full rounded-2xl border border-white/[0.08] bg-[#161616] py-3 pr-4 text-sm text-white shadow-sm outline-none transition placeholder:text-white/40 focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]';

  // Ensures text never overlaps the left icon (fixes global `input { padding }` override)
  const withIconStyle = { paddingLeft: '2.75rem' };
  const withBothIconsStyle = { paddingLeft: '2.75rem', paddingRight: '2.75rem' };

  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]';

  // ── Inline field error component ─────────────────────────────────────────

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="mt-1 px-1 text-xs font-semibold text-red-400">{fieldErrors[name]}</p>
    ) : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#161616]/95 p-6 shadow-2xl backdrop-blur sm:p-8">

        {/* Icon badge — unchanged */}
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B00] text-white shadow-lg shadow-orange-950/30">
          <FiShoppingBag size={26} />
        </div>

        {/* Heading — unchanged */}
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-black text-white">Create Account</h2>
          <p className="mt-2 text-sm text-white/50">Start shopping EcoMart deals with a secure account.</p>
        </div>

        {/* Global error (non-field-specific backend errors) — unchanged */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Full Name ── */}
          <div>
            <div className="relative">
              <FiUser size={16} className={iconClass} />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={(e) => validateField('fullName', e.target.value)}
                className={inputBase}
                style={withIconStyle}
                required
              />
            </div>
            <FieldError name="fullName" />
          </div>

          {/* ── Email ── */}
          <div>
            <div className="relative">
              <FiMail size={16} className={iconClass} />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={(e) => validateField('email', e.target.value)}
                className={inputBase}
                style={withIconStyle}
                required
              />
            </div>
            <FieldError name="email" />
          </div>

          {/* ── Phone Number ── */}
          <div>
            <div className="relative">
              <FiPhone size={16} className={iconClass} />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={formData.phoneNumber}
                onChange={(e) =>
                  // Allow only digits, max 10 characters — unchanged behaviour
                  handleChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                onBlur={(e) => validateField('phoneNumber', e.target.value)}
                className={inputBase}
                style={withIconStyle}
                required
              />
            </div>
            <FieldError name="phoneNumber" />
          </div>

          {/* ── Gender select — unchanged ── */}
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="w-full rounded-2xl border border-white/[0.08] bg-[#161616] px-4 py-3 text-sm text-white shadow-sm outline-none transition focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]"
            style={{ padding: '12px 16px' }}
            required
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>

          {/* ── Password — with live strength popup ── */}
          <div>
            {/* `relative` on the outer wrapper so the popup positions correctly */}
            <div className="relative">
              <FiLock size={16} className={iconClass} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={(e) => {
                  setPasswordFocused(false);
                  validateField('password', e.target.value);
                }}
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

              {/* Strength popup — visible only while the field is focused */}
              <PasswordStrengthPopup
                password={formData.password}
                visible={passwordFocused}
              />
            </div>
            <FieldError name="password" />
          </div>

          {/* ── Confirm Password ── */}
          <div>
            <div className="relative">
              <FiLock size={16} className={iconClass} />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
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
            <FieldError name="confirmPassword" />
          </div>

          {/* ── Register button — unchanged ── */}
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

        {/* Login link — unchanged */}
        <p className="mt-5 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-black text-[#FF6B00] transition hover:text-orange-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

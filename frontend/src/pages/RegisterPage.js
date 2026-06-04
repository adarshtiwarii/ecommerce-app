import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingBag, FiUser, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

// ─── Validation Helpers ───────────────────────────────────────────────────────

// Full name: only letters, spaces, dots, hyphens — no numbers or special chars allowed
const isValidFullName = (name) => /^[A-Za-z\s.\-']{2,50}$/.test(name.trim());

// Basic RFC-compliant email format check
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Password strength rules — each rule returns true if the condition is satisfied
const passwordRules = [
  { id: 'length',  label: 'At least 8 characters',                      test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'At least one uppercase letter (A–Z)',          test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'At least one lowercase letter (a–z)',          test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'At least one number (0–9)',                    test: (p) => /\d/.test(p) },
  { id: 'special', label: 'At least one special character (@$!%*?&#)',    test: (p) => /[@$!%*?&#]/.test(p) },
];

// Returns a count 0–5 of how many password rules currently pass
const getPasswordStrength = (password) => passwordRules.filter((r) => r.test(password)).length;

// Labels and colors mapped to strength score (index = score)
const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

// ─── ValidationPopup ─────────────────────────────────────────────────────────
/**
 * Large, clearly readable popup shown whenever any field fails validation.
 * Displays the field name, the exact reason it failed, and a fix hint.
 * Shown on form submit OR on field blur if value is invalid.
 *
 * Props:
 *  - fieldName  : human-readable field label (e.g. "Full Name")
 *  - message    : the specific error reason to display
 *  - hint       : short guidance on how to fix it
 *  - onClose    : callback to dismiss the popup
 */
const ValidationPopup = ({ fieldName, message, hint, onClose }) => {
  if (!message) return null;

  return (
    // Full-screen semi-transparent overlay — clicking outside closes the popup
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      {/* Popup card — stop click propagation so clicking card doesn't close it */}
      <div
        className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#1a1a1a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row: warning icon + field name */}
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15">
            <FiAlertCircle size={22} className="text-red-400" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400">
              Validation Error
            </p>
            {/* Field label — large and bold so user immediately knows which field failed */}
            <p className="text-lg font-black text-white leading-tight">{fieldName}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-white/[0.06]" />

        {/* Main error reason — large readable text */}
        <p className="mb-2 text-base font-semibold leading-relaxed text-white/90">
          {message}
        </p>

        {/* Fix hint — slightly muted, still readable */}
        {hint && (
          <p className="mb-5 text-sm leading-relaxed text-white/50">
            {hint}
          </p>
        )}

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-black text-white transition hover:bg-red-600 active:scale-95"
        >
          Got it — Fix Now
        </button>
      </div>
    </div>
  );
};

// ─── PasswordStrengthPopup ────────────────────────────────────────────────────
/**
 * Floating inline popup shown while the password field is focused.
 * Displays a color-coded strength bar and a checklist of all 5 rules.
 * Visible only when password field is focused AND has at least 1 character typed.
 */
const PasswordStrengthPopup = ({ password, visible }) => {
  const strength = getPasswordStrength(password);

  // Hide if field is not focused or password is still empty
  if (!visible || password.length === 0) return null;

  return (
    <div
      className="absolute left-0 z-50 mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#1e1e1e] p-4 shadow-2xl"
      style={{ top: '100%' }}
    >
      {/* Strength bar with label */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-white/50">Password Strength</span>
          <span className="text-xs font-black" style={{ color: strengthColors[strength] }}>
            {strengthLabels[strength]}
          </span>
        </div>
        {/* Five segment bar — filled segments use the strength color */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="h-2 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: level <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Rule checklist — clearly shows what is still missing */}
      <ul className="space-y-2">
        {passwordRules.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-2.5">
              {/* Green check or red cross icon */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: passed ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.12)',
                }}
              >
                {passed
                  ? <FiCheckCircle size={12} color="#22c55e" />
                  : <FiAlertCircle size={12} color="#ef4444" />
                }
              </span>
              {/* Rule label — readable size */}
              <span
                className="text-sm font-medium leading-tight"
                style={{ color: passed ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)' }}
              >
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

  // Stores inline error messages shown below each field after blur
  const [fieldErrors, setFieldErrors] = useState({});

  // Controls the large validation popup: null = hidden, object = shown
  // Shape: { fieldName: string, message: string, hint: string }
  const [popup, setPopup] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Controls whether the password strength popup is visible
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { register } = useApp();
  const navigate = useNavigate();

  // ── Show the large validation popup for a specific field ─────────────────
  /**
   * Triggers the full-screen ValidationPopup with field-specific content.
   * Called on blur (if invalid) and on submit (for the first failing field).
   *
   * @param {string} field - internal field key (e.g. 'fullName')
   * @param {string} message - the reason for failure shown in large text
   * @param {string} hint - short fix suggestion shown below the message
   */
  const showPopup = (field, message, hint) => {
    setPopup({ field, message, hint });
  };

  // Dismiss the large popup
  const closePopup = () => setPopup(null);

  // ── Field-level validation — called on blur and on submit ────────────────
  /**
   * Validates a single field by name.
   * Sets the inline error message and optionally shows the large popup.
   *
   * @param {string} name  - field key matching formData keys
   * @param {string} value - current field value
   * @param {boolean} withPopup - if true, show the large popup on failure
   * @returns {boolean} true = valid, false = invalid
   */
  const validateField = (name, value, withPopup = false) => {
    let msg = '';
    let hint = '';
    let label = '';

    switch (name) {
      // ── Full Name ──────────────────────────────────────────────────────────
      case 'fullName':
        label = 'Full Name';
        if (!value.trim()) {
          msg  = 'Full Name is required. Please enter your full name.';
          hint = 'Example: John Smith';
        } else if (value.trim().length < 2) {
          msg  = 'Full Name is too short. It must be at least 2 characters.';
          hint = 'Enter your first and last name.';
        } else if (!isValidFullName(value)) {
          msg  = 'Full Name must contain only letters, spaces, hyphens, or apostrophes. Numbers and special characters are not allowed.';
          hint = 'Example: Mary-Jane O\'Brien';
        }
        break;

      // ── Email ──────────────────────────────────────────────────────────────
      case 'email':
        label = 'Email Address';
        if (!value.trim()) {
          msg  = 'Email Address is required. Please enter your email.';
          hint = 'Example: yourname@gmail.com';
        } else if (!isValidEmail(value)) {
          msg  = 'The email address you entered is not valid. It must include "@" and a domain like ".com" or ".in".';
          hint = 'Correct format: user@example.com';
        }
        break;

      // ── Phone Number ───────────────────────────────────────────────────────
      case 'phoneNumber':
        label = 'Phone Number';
        if (!value) {
          msg  = 'Phone Number is required.';
          hint = 'Enter a valid 10-digit Indian mobile number.';
        } else if (value.length !== 10) {
          msg  = `Phone Number must be exactly 10 digits. You have entered ${value.length} digit${value.length === 1 ? '' : 's'}.`;
          hint = 'Example: 9876543210';
        }
        break;

      // ── Password ───────────────────────────────────────────────────────────
      case 'password':
        label = 'Password';
        if (!value) {
          msg  = 'Password is required.';
          hint = 'Create a strong password using uppercase, lowercase, numbers, and special characters.';
        } else {
          // List which specific rules are still failing
          const failing = passwordRules.filter((r) => !r.test(value));
          if (failing.length > 0) {
            msg  = `Your password is not strong enough. The following ${failing.length === 1 ? 'requirement is' : 'requirements are'} not met: ${failing.map((r) => r.label).join(', ')}.`;
            hint = 'A strong password looks like: MyPass@123';
          }
        }
        break;

      // ── Confirm Password ───────────────────────────────────────────────────
      case 'confirmPassword':
        label = 'Confirm Password';
        if (!value) {
          msg  = 'Please re-enter your password to confirm it.';
          hint = 'Type the same password you entered above.';
        } else if (value !== formData.password) {
          msg  = 'Passwords do not match. The confirmation password must be exactly the same as the password you entered.';
          hint = 'Make sure there are no typos or extra spaces.';
        }
        break;

      default:
        break;
    }

    // Always update the small inline error shown below the field
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));

    // Optionally show the large popup (used on blur or first-fail-on-submit)
    if (msg && withPopup) {
      showPopup(name, msg, hint);
    }

    return msg === '';
  };

  // ── Change handler — clears inline error as user types ───────────────────
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Remove inline error immediately so user gets real-time feedback
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Submit handler — validates all fields, shows popup for first failure ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate every field in order; stop at the first failure and show popup
    const fields = ['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'];
    for (const field of fields) {
      const valid = validateField(field, formData[field], true); // withPopup = true
      if (!valid) return; // Stop and let the popup guide the user
    }

    setLoading(true);
    try {
      const result = await register(formData);

      if (result?.success) {
        navigate('/login');
      } else {
        const msg = result?.message || '';

        // If the backend reports a duplicate phone number, show it as a popup
        if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('mobile')) {
          const dupMsg = 'This phone number is already registered with another account. Please use a different phone number.';
          setFieldErrors((prev) => ({ ...prev, phoneNumber: dupMsg }));
          showPopup('phoneNumber', dupMsg, 'Try logging in if this is your number, or enter a different one.');
        } else {
          setError(msg || 'Registration failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared CSS class strings (unchanged from original) ───────────────────

  const inputBase =
    'w-full rounded-2xl border border-white/[0.08] bg-[#161616] py-3 pr-4 text-sm text-white shadow-sm outline-none transition placeholder:text-white/40 focus:border-[#FF6B00] focus:ring-4 focus:ring-[rgba(255,107,0,0.18)]';

  // Inline padding styles to prevent text overlapping the left icon
  // (overrides the global `input { padding: 12px 14px }` rule in index.css)
  const withIconStyle     = { paddingLeft: '2.75rem' };
  const withBothIconsStyle = { paddingLeft: '2.75rem', paddingRight: '2.75rem' };

  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]';

  // ── Small inline error shown directly below each field ───────────────────
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="mt-1.5 px-1 text-xs font-semibold leading-snug text-red-400">
        {fieldErrors[name]}
      </p>
    ) : null;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_34%)]" />

      {/* Large validation popup — shown on field blur failure or submit failure */}
      <ValidationPopup
        fieldName={
          popup?.field === 'fullName'       ? 'Full Name'       :
          popup?.field === 'email'          ? 'Email Address'   :
          popup?.field === 'phoneNumber'    ? 'Phone Number'    :
          popup?.field === 'password'       ? 'Password'        :
          popup?.field === 'confirmPassword'? 'Confirm Password': ''
        }
        message={popup?.message}
        hint={popup?.hint}
        onClose={closePopup}
      />

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

        {/* Global backend error (not field-specific) */}
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
                // On blur: validate and show popup if invalid
                onBlur={(e) => validateField('fullName', e.target.value, true)}
                className={inputBase}
                style={withIconStyle}
                required
              />
            </div>
            {/* Small inline error below field */}
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
                onBlur={(e) => validateField('email', e.target.value, true)}
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
                // Strip non-digits, limit to 10 characters — unchanged behaviour
                onChange={(e) =>
                  handleChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                onBlur={(e) => validateField('phoneNumber', e.target.value, true)}
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

          {/* ── Password — live strength popup shown while focused ── */}
          <div>
            {/* Outer wrapper is `relative` so the strength popup positions under this field */}
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
                  validateField('password', e.target.value, true);
                }}
                className={inputBase}
                style={withBothIconsStyle}
                required
              />
              {/* Eye toggle button — unchanged */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-[#FF6B00]"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>

              {/* Inline strength popup — appears while typing, disappears on blur */}
              <PasswordStrengthPopup password={formData.password} visible={passwordFocused} />
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
                onBlur={(e) => validateField('confirmPassword', e.target.value, true)}
                className={inputBase}
                style={withBothIconsStyle}
                required
              />
              {/* Eye toggle button — unchanged */}
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
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { AUTH_GENDER_OPTIONS, AUTH_TEXT, BRAND } from '../constants/labels';
import { ROUTES } from '../constants/routes';

const FORM_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
};

const LoginPage = ({ initialMode = FORM_MODES.LOGIN }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
    resetToken: '',
    rememberMe: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devResetToken, setDevResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { login, register, requestPasswordReset, resetPassword } = useApp();
  const navigate = useNavigate();
  const isRegister = mode === FORM_MODES.REGISTER;
  const isForgot = mode === FORM_MODES.FORGOT;

  const heading = useMemo(() => {
    if (isForgot) return AUTH_TEXT.forgotTitle;
    return isRegister ? AUTH_TEXT.registerTitle : AUTH_TEXT.loginTitle;
  }, [isForgot, isRegister]);

  const subText = useMemo(() => {
    if (isForgot) return AUTH_TEXT.forgotSub;
    return isRegister ? AUTH_TEXT.registerSub : AUTH_TEXT.loginSub;
  }, [isForgot, isRegister]);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!formData.email.trim()) return `${AUTH_TEXT.email} is required`;
    if (isForgot) {
      if (formData.resetToken && formData.password.length < 6) return 'New password must be at least 6 characters';
      return null;
    }
    if (isRegister) {
      if (!formData.name.trim()) return `${AUTH_TEXT.fullName} is required`;
      if (!/^\d{10}$/.test(formData.phoneNumber)) return 'Enter a valid 10-digit phone number';
      if (!formData.gender) return `${AUTH_TEXT.gender} is required`;
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    }
    if (!formData.password) return `${AUTH_TEXT.password} is required`;
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (isForgot) {
        if (!formData.resetToken) {
          const result = await requestPasswordReset(formData.email);
          if (result.success) {
            setSuccess(result.emailSent ? 'Reset link sent to your email.' : result.message);
            setDevResetToken(result.devResetToken || '');
          } else {
            setError(result.message);
          }
        } else {
          const result = await resetPassword(formData.resetToken, formData.password);
          if (result.success) {
            setSuccess(result.message);
            setDevResetToken('');
            setTimeout(() => switchMode(FORM_MODES.LOGIN), 900);
          } else {
            setError(result.message);
          }
        }
        return;
      }
      if (!isRegister) {
        const result = await login(formData.email, formData.password, formData.rememberMe);
        if (result.success) navigate(ROUTES.HOME);
        else setError(result.message);
        return;
      }
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
        setTimeout(() => switchMode(FORM_MODES.LOGIN), 1200);
      } else {
        setError(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setDevResetToken('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, var(--primary-subtle), transparent 34%), radial-gradient(circle at bottom right, var(--bg-glass-hover), transparent 32%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }} style={{ position: 'relative', width: '100%', maxWidth: 440, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 28, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 56, height: 56, margin: '0 auto 20px', borderRadius: 'var(--radius-lg)', background: 'var(--primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-orange-sm)' }}>
          <FiShoppingBag size={26} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{heading}</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{subText}</p>
        </div>
        {!isForgot && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 20 }}>
            {[{ value: FORM_MODES.LOGIN, label: AUTH_TEXT.login }, { value: FORM_MODES.REGISTER, label: AUTH_TEXT.register }].map(tab => (
              <motion.button key={tab.value} type="button" whileTap={{ scale: 0.97 }} onClick={() => switchMode(tab.value)} style={{ borderRadius: 'var(--radius-md)', padding: '10px 14px', fontWeight: 700, background: mode === tab.value ? 'var(--primary-subtle)' : 'transparent', color: mode === tab.value ? 'var(--primary)' : 'var(--text-secondary)', border: mode === tab.value ? '1px solid var(--primary-border)' : '1px solid transparent' }}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        )}
        {error && <div style={{ marginBottom: 14, border: '1px solid var(--error-bg)', background: 'var(--error-bg)', color: 'var(--error-bright)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontWeight: 600, fontSize: 13 }}>{error}</div>}
        {success && <div style={{ marginBottom: 14, border: '1px solid var(--success-bg)', background: 'var(--success-bg)', color: 'var(--success-bright)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontWeight: 600, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}><FiCheck /> {success}</div>}
        {devResetToken && <div style={{ marginBottom: 14, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}><strong>{AUTH_TEXT.devResetToken}:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{devResetToken}</span></div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isRegister && (
            <>
              <Field icon={<FiUser />} placeholder={AUTH_TEXT.fullName} value={formData.name} onChange={value => update('name', value)} />
              <Field icon={<FiPhone />} placeholder={AUTH_TEXT.phone} value={formData.phoneNumber} onChange={value => update('phoneNumber', value.replace(/\D/g, '').slice(0, 10))} />
              <select value={formData.gender} onChange={event => update('gender', event.target.value)} required>
                {AUTH_GENDER_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </>
          )}
          <Field icon={<FiMail />} type="email" placeholder={AUTH_TEXT.email} value={formData.email} onChange={value => update('email', value)} />
          {isForgot && <Field icon={<FiLock />} placeholder={AUTH_TEXT.resetToken} value={formData.resetToken} onChange={value => update('resetToken', value)} required={false} />}
          {(!isForgot || formData.resetToken) && <PasswordField icon={<FiLock />} placeholder={isForgot ? AUTH_TEXT.resetPassword : AUTH_TEXT.password} value={formData.password} visible={showPassword} onToggle={() => setShowPassword(value => !value)} onChange={value => update('password', value)} />}
          {isRegister && <PasswordField icon={<FiLock />} placeholder={AUTH_TEXT.confirmPassword} value={formData.confirmPassword} visible={showConfirm} onToggle={() => setShowConfirm(value => !value)} onChange={value => update('confirmPassword', value)} />}
          {!isRegister && !isForgot && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                <input type="checkbox" checked={formData.rememberMe} onChange={event => update('rememberMe', event.target.checked)} style={{ width: 16, height: 16 }} />
                {AUTH_TEXT.rememberMe}
              </label>
              <button type="button" onClick={() => switchMode(FORM_MODES.FORGOT)} style={{ background: 'transparent', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>{AUTH_TEXT.forgotPassword}</button>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{AUTH_TEXT.agreePrefix}</p>
          <motion.button type="submit" whileTap={{ scale: 0.96 }} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px 18px' }}>
            {loading && <span className="spinner" />}
            {loading ? (isForgot ? (formData.resetToken ? AUTH_TEXT.loadingReset : AUTH_TEXT.loadingToken) : isRegister ? AUTH_TEXT.loadingRegister : AUTH_TEXT.loadingLogin) : isForgot ? (formData.resetToken ? AUTH_TEXT.resetPassword : AUTH_TEXT.sendReset) : isRegister ? AUTH_TEXT.createAccount : AUTH_TEXT.login}
          </motion.button>
        </form>
        <p style={{ marginTop: 18, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          {isForgot ? <button type="button" onClick={() => switchMode(FORM_MODES.LOGIN)} style={{ color: 'var(--primary)', background: 'transparent', fontWeight: 800 }}>{AUTH_TEXT.backToLogin}</button> : <>{isRegister ? AUTH_TEXT.hasAccount : AUTH_TEXT.noAccount} <button type="button" onClick={() => switchMode(isRegister ? FORM_MODES.LOGIN : FORM_MODES.REGISTER)} style={{ color: 'var(--primary)', background: 'transparent', fontWeight: 800 }}>{isRegister ? AUTH_TEXT.login : AUTH_TEXT.register}</button></>}
        </p>
        <Link to={ROUTES.HOME} style={{ display: 'block', marginTop: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>{BRAND.name}</Link>
      </motion.div>
    </div>
  );
};

const Field = ({ icon, value, onChange, placeholder, type = 'text', required = true }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', display: 'flex' }}>{icon}</span>
    <input type={type} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} required={required} style={{ paddingLeft: 42 }} />
  </div>
);

const PasswordField = ({ icon, value, onChange, placeholder, visible, onToggle }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', display: 'flex' }}>{icon}</span>
    <input type={visible ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} required style={{ paddingLeft: 42, paddingRight: 42 }} />
    <button type="button" onClick={onToggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'transparent', display: 'flex' }}>
      {visible ? <FiEyeOff /> : <FiEye />}
    </button>
  </div>
);

export default LoginPage;

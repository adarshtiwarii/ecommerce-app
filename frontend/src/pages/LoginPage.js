import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { login, register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'login') {
      const ok = await login(formData.email, formData.password);
      if (ok) navigate('/');
      else setError('Invalid email or password');
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const ok = await register({
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (ok) navigate('/login');
      else setError('Registration failed');
    }
  };

  return (
    <div className="bg-cinematic-dark min-h-screen flex items-center justify-center py-8">
      <div className="max-w-4xl w-full mx-auto flex shadow-2xl rounded-xl overflow-hidden">
        {/* Left panel (branding) */}
        <div className="bg-cinematic-accent p-8 flex-col justify-between hidden md:flex w-2/5">
          <div>
            <h1 className="text-white text-3xl font-bold mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Join EcoMart'}
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              {mode === 'login'
                ? 'Access your orders, wishlist and personalized recommendations'
                : 'Create an account to explore sustainable products and exclusive deals'}
            </p>
          </div>
          <div className="mt-8">
            <div className="text-white text-sm opacity-80">🌿 Eco‑friendly shopping</div>
            <div className="text-white text-sm opacity-80">🚚 Free delivery on orders above ₹499</div>
          </div>
        </div>

        {/* Right panel – form */}
        <div className="bg-cinematic-card flex-1 p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="max-w-sm w-full mx-auto">
            <div className="flex gap-4 mb-6 border-b border-cinematic-border">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(''); }}
                  className={`pb-2 text-sm font-bold transition capitalize ${
                    mode === m
                      ? 'border-b-2 border-cinematic-accent text-cinematic-accent'
                      : 'text-gray-400 border-b-2 border-transparent hover:text-gray-300'
                  }`}
                >
                  {m === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-300 text-sm px-3 py-2 rounded-lg mb-4 font-medium">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number (10 digits)"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <select
                    name="gender"
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
                </div>
              </>
            )}

            <div className="mb-4">
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
                required
              />
            </div>

            <div className="mb-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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

            {mode === 'register' && (
              <div className="mb-4 relative">
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
            )}

            <p className="text-xs text-gray-400 mb-4">
              By continuing, you agree to EcoMart's{' '}
              <Link to="#" className="text-cinematic-accent hover:underline">Terms of Use</Link> and{' '}
              <Link to="#" className="text-cinematic-accent hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              className="w-full bg-cinematic-accent hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
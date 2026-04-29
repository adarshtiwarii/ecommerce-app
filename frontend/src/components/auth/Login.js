// src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setFormData({ emailOrPhone: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.email);
        if (data.fullName) localStorage.setItem('userName', data.fullName);
        if (data.role) localStorage.setItem('userRole', data.role);
        if (data.userId) localStorage.setItem('userId', data.userId);
        if (rememberMe) {
          localStorage.setItem('savedEmail', formData.emailOrPhone);
          localStorage.setItem('savedPassword', formData.password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }
        setMessage({ text: '✅ Login successful! Redirecting...', type: 'success' });
        setTimeout(() => navigate('/home'), 1500);
      } else {
        const errorMsg = await response.text();
        setMessage({ text: errorMsg || 'Invalid credentials', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Password reset feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md p-6 md:p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-6">
          <FaShoppingCart className="text-5xl neon-text mx-auto mb-2" />
          <h1 className="text-3xl font-light tracking-wide text-white">Eco<span className="neon-text">Mart</span></h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to continue</p>
        </div>
        <h2 className="text-2xl font-light text-center text-white mb-6">Welcome Back</h2>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-xl text-center text-sm ${
              message.type === 'success'
                ? 'bg-green-900/40 border border-neon-green text-neon-green'
                : 'bg-red-900/40 border border-red-500 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 hover:border-neon-green/60"
              placeholder="you@example.com or 9876543210"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-light text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 pr-10"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-neon-green"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-neon-green"
              />
              <span className="text-sm text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-neon-green hover:underline transition"
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-3 rounded-xl border border-neon-green/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/ecommerce-app/register" className="text-neon-green hover:underline transition">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
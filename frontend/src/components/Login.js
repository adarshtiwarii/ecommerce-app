// src/components/Login.js
import React, { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.email);
        setMessage({ text: '✅ Login successful! Redirecting...', type: 'success' });
        setTimeout(() => window.location.href = '/products', 1500);
      } else {
        const errorMsg = await response.text();
        setMessage({ text: errorMsg || 'Invalid credentials', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-up">
        <div className="text-center mb-4">
          <div className="text-6xl neon-text mb-1">🛒✨</div>
          <h1 className="text-3xl font-light tracking-wider text-white">Eco<span className="neon-text">Mart</span></h1>
          <p className="text-[10px] text-gray-400 mt-1">Sign in to continue</p>
        </div>

        <h2 className="text-2xl font-light text-center text-white mb-6">Welcome Back</h2>

        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-center text-sm ${
            message.type === 'success' ? 'bg-green-900/30 border border-neon-green text-neon-green' : 'bg-red-900/30 border border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Email or Phone Number</label>
            <input
              type="text"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition"
              placeholder="you@example.com or 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green transition"
              placeholder="••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-3 rounded-xl border border-neon-green/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account? <a href="/register" className="text-neon-green hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
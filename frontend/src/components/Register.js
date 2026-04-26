// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Client-side validations
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setMessage({ text: 'Phone number must be exactly 10 digits', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.text();
      if (response.ok) {
        setMessage({ text: '✅ Registration successful! Please Sign in.', type: 'success' });
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          gender: '',
          password: '',
          confirmPassword: '',
        });
        // Auto‑redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ text: data || 'Registration failed. Please try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Is backend running?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md p-6 md:p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-6">
          <FaShoppingCart className="text-5xl neon-text mx-auto mb-2" />
          <h1 className="text-3xl font-light tracking-wide text-white">Eco<span className="neon-text">Mart</span></h1>
          <p className="text-xs text-gray-400 mt-1">Join the dark side of shopping</p>
        </div>
        <h2 className="text-2xl font-light text-center text-white mb-6">Create Account</h2>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 hover:border-neon-green/60"
              placeholder="Adarsh Tiwari"
            />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 hover:border-neon-green/60"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              maxLength="10"
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 hover:border-neon-green/60"
              placeholder="9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 hover:border-neon-green/60"
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm font-light text-gray-300 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 pr-10"
              placeholder="Min 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-neon-green"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-light text-gray-300 mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all duration-200 pr-10"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-400 hover:text-neon-green"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-3 rounded-xl border border-neon-green/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 mt-4"
          >
            {loading ? 'Registering...' : 'Sign Up →'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/ecommerce-app/login" className="text-neon-green hover:underline transition">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
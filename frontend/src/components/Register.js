import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setMessage({ text: 'Phone number must be 10 digits', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.text();http://localhost:3000/register
      if (response.ok) {
        setMessage({ text: '✅ Registration successful! Please Sign in.', type: 'success' });
        setFormData({ fullName: '', email: '', phoneNumber: '', gender: '', password: '', confirmPassword: '' });
      } else {
        setMessage({ text: data || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Is backend running?', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-4">
          <div className="text-6xl neon-text mb-1">🛒✨</div>
          <h1 className="text-3xl font-light tracking-wider text-white">Eco<span className="neon-text">Mart</span></h1>
          <p className="text-[10px] text-gray-400">Dark‑Cinematic E‑commerce</p>
        </div>
        <h2 className="text-2xl font-light text-center text-white mb-6">Create Account</h2>

        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-center text-sm ${
            message.type === 'success' ? 'bg-green-900/30 border border-neon-green text-neon-green' : 'bg-red-900/30 border border-red-500 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-light text-gray-300">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green"
              placeholder="Full Name" />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300">Phone Number</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required pattern="[0-9]{10}" maxLength="10"
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green"
              placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green"
              placeholder="•••••••• (min 8)" />
          </div>
          <div>
            <label className="block text-sm font-light text-gray-300">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
              className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-3 rounded-xl border border-neon-green/50 transition-all duration-300 disabled:opacity-50 mt-2">
            {loading ? 'Registering...' : 'Sign Up →'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account? <a href="/login" className="text-neon-green hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
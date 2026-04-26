import React from 'react';
import { FaSignOutAlt, FaCopy, FaShoppingCart } from 'react-icons/fa';

function Products() {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    window.location.href = '/login';
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black text-white p-6 md:p-8">
      <div className="glass-card max-w-4xl mx-auto p-6 md:p-8 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaShoppingCart className="text-2xl neon-text" />
            <h1 className="text-3xl font-light">Products</h1>
          </div>
          <div className="flex gap-3">
            {token && (
              <button onClick={copyToken} className="flex items-center gap-2 bg-neon-green/20 hover:bg-neon-green/40 text-neon-green px-4 py-2 rounded-xl transition">
                <FaCopy /> Copy Token
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-xl transition">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        <p className="text-gray-300 mb-4">Welcome, {email || 'User'}!</p>
        <p className="text-sm text-gray-400 mb-6">
          Token status: {token ? '✅ Present' : '❌ Missing'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-forest-surface/50 p-4 rounded-xl border border-neon-green/20 hover:border-neon-green/50 transition hover:scale-[1.02]">
              <h3 className="font-semibold">Product {i}</h3>
              <p className="text-sm text-gray-300">Sample product card – real data coming soon.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;
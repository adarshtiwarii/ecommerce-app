// frontend/src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBoxOpen, FaClipboardList, FaUser } from 'react-icons/fa';

const Home = () => {
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black text-white">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <FaShoppingCart className="text-6xl neon-text mx-auto mb-4" />
        <h1 className="text-5xl md:text-6xl font-light tracking-tight">
          Welcome back, <span className="neon-text">{userName}</span>!
        </h1>
        <p className="text-gray-300 text-lg mt-4 max-w-2xl mx-auto">
          Your premier destination for dark cinematic e-commerce. Discover amazing
          products, manage your orders, and enjoy a seamless shopping experience.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/products"
            className="bg-neon-green/20 hover:bg-neon-green/40 text-neon-green px-6 py-3 rounded-xl border border-neon-green/50 transition-all duration-300 inline-flex items-center gap-2"
          >
            <FaBoxOpen /> Shop Now
          </Link>
          <Link
            to="/profile"
            className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-6 py-3 rounded-xl border border-gray-500 transition-all duration-300 inline-flex items-center gap-2"
          >
            <FaUser /> View Profile
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<FaBoxOpen className="text-4xl neon-text" />}
          title="Wide Selection"
          description="Browse through our curated collection of premium products."
        />
        <FeatureCard
          icon={<FaClipboardList className="text-4xl neon-text" />}
          title="Easy Orders"
          description="Simple checkout process with order tracking and history."
        />
        <FeatureCard
          icon={<FaShoppingCart className="text-4xl neon-text" />}
          title="Secure Payments"
          description="Multiple payment options with industry-standard security."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-6 text-center rounded-2xl transition-all duration-300 hover:scale-105">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

export default Home;
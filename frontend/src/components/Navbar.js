import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav className="bg-forest-surface/80 backdrop-blur-md border-b border-neon-green/30 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/home" className="flex items-center gap-2 text-white hover:text-neon-green transition">
          <FaShoppingCart className="text-2xl neon-text" />
          <span className="text-xl font-light tracking-wider">Eco<span className="neon-text">Mart</span></span>
        </Link>
        <div className="flex items-center gap-4">
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt /> Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
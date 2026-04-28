import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import useSearchSuggestions from '../../hooks/useSearchSuggestions';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { suggestions } = useSearchSuggestions(query);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setQuery(product.name);
    navigate(`/product/${product.id}`);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-forest-surface/80 backdrop-blur-md border-b border-neon-green/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white hover:text-neon-green transition">
            <FaShoppingCart className="text-2xl neon-text" />
            <span className="text-xl font-light tracking-wider">Eco<span className="neon-text">Mart</span></span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl mx-8 relative">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search for products..."
                className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button type="submit" className="hidden">Search</button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-forest-surface rounded-xl shadow-xl border border-neon-green/30 z-20">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-4 py-2 hover:bg-forest-deep cursor-pointer flex items-center gap-3 text-white"
                  >
                    <img src={item.imageUrl || '/placeholder.png'} alt={item.name} className="w-8 h-8 object-cover" />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-neon-green">₹{item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {token && (
              <>
                <Link to="/profile" className="text-gray-300 hover:text-neon-green">
                  <FaUser size={20} />
                </Link>
                {role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-300 hover:text-neon-green">Admin</Link>
                )}
                {role === 'SELLER' && (
                  <Link to="/seller" className="text-gray-300 hover:text-neon-green">Seller</Link>
                )}
                <Link to="/cart" className="relative text-gray-300 hover:text-neon-green">
                  <FaShoppingCart className="text-xl" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-3 bg-neon-green text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-400">
                  <FaSignOutAlt size={20} />
                </button>
              </>
            )}
            {!token && (
              <Link to="/login" className="text-gray-300 hover:text-neon-green">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
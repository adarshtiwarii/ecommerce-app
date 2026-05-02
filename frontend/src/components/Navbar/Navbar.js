import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLogOut,
  FiHome, FiMonitor, FiSmartphone, FiTablet, FiGrid, FiUser as FiUserIcon, 
  FiUsers, FiTool, FiHome as FiHomeFurniture, FiSmile
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, user, logout } = useApp();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navCategories = [
    { name: 'For You', link: '/', icon: FiHome },
    { name: 'Electronics', link: '/category/Electronics', icon: FiMonitor },
    { name: 'Mobiles', link: '/category/Electronics', icon: FiSmartphone },
    { name: 'Laptops', link: '/category/Electronics', icon: FiTablet },
    { name: 'Fashion', link: '/category/Fashion', icon: FiGrid },
    { name: 'Men', link: '/category/Fashion', icon: FiUserIcon },
    { name: 'Women', link: '/category/Fashion', icon: FiUsers },
    { name: 'Appliances', link: '/category/Appliances', icon: FiTool },
    { name: 'Home & Furniture', link: '/category/Home', icon: FiHomeFurniture },
    { name: 'Beauty', link: '/category/Beauty', icon: FiSmile },
  ];

  return (
    <nav className="bg-cinematic-dark border-b border-cinematic-border sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-white font-bold">
              <span className="text-2xl tracking-tight text-cinematic-accent">EcoMart</span>
              <div className="flex items-center gap-1 text-xs text-cinematic-text-muted">
                <span className="italic">Shop</span>
                <span className="italic">Responsibly</span>
                <span className="text-cinematic-accent">🌿</span>
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="flex w-full bg-gray-800 rounded-full overflow-hidden border border-cinematic-border focus-within:ring-2 focus-within:ring-cinematic-accent">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-2.5 text-sm bg-gray-800 text-white placeholder-gray-400 outline-none"
              />
              <button type="submit" className="px-4 text-cinematic-accent hover:text-white transition">
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          {/* Right Icons with Text Labels */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative flex items-center">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-1 text-cinematic-text hover:text-cinematic-accent transition">
                <FiUser size={20} />
                <span className="text-sm font-medium hidden sm:inline">Account</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 bg-cinematic-card rounded-lg shadow-xl w-48 z-50 border border-cinematic-border">
                  {!user ? (
                    <div className="p-4">
                      <p className="text-sm text-cinematic-text-muted mb-2">New Customer?</p>
                      <Link to="/login" onClick={() => setShowUserMenu(false)} className="block w-full text-center bg-cinematic-accent text-white py-2 rounded text-sm font-medium mb-2 hover:opacity-90 transition">Sign Up</Link>
                      <Link to="/login" onClick={() => setShowUserMenu(false)} className="block w-full text-center border border-cinematic-accent text-cinematic-accent py-2 rounded text-sm font-medium hover:bg-cinematic-accent/10 transition">Login</Link>
                    </div>
                  ) : (
                    <div>
                      <div className="p-3 border-b border-cinematic-border">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-cinematic-text-muted">{user.email}</p>
                        <p className="text-xs text-cinematic-accent mt-1">Role: {user.role}</p>
                      </div>
                      {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 text-cinematic-text"><FiUser size={14} /> Admin Panel</Link>}
                      {user.role === 'SELLER' && <Link to="/seller" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 text-cinematic-text"><FiUser size={14} /> Seller Dashboard</Link>}
                      <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 text-cinematic-text"><FiHeart size={14} /> Wishlist</Link>
                      <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-800 w-full text-red-400"><FiLogOut size={14} /> Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/wishlist" className="flex items-center gap-1 text-cinematic-text hover:text-cinematic-accent transition">
              <FiHeart size={20} />
              <span className="text-sm font-medium hidden sm:inline">Wishlist</span>
            </Link>

            <Link to="/cart" className="relative flex items-center gap-1 text-cinematic-text hover:text-cinematic-accent transition">
              <FiShoppingCart size={20} />
              <span className="text-sm font-medium hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-cinematic-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button className="sm:hidden text-cinematic-text" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        <div className="sm:hidden pb-2">
          <form onSubmit={handleSearch} className="flex bg-gray-800 rounded-full overflow-hidden border border-cinematic-border">
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 text-sm bg-gray-800 text-white outline-none" />
            <button type="submit" className="px-3 text-cinematic-accent"><FiSearch size={18} /></button>
          </form>
        </div>
      </div>

      {/* Desktop Category Bar – text "For You" will appear here */}
      <div className="bg-cinematic-card border-t border-cinematic-border hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-2">
            {navCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={cat.link}
                  className="flex items-center gap-2 py-2 text-sm font-semibold text-cinematic-text hover:text-cinematic-accent whitespace-nowrap transition drop-shadow-sm"
                >
                  <Icon size={16} className="text-cinematic-accent" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Category Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-cinematic-card border-t border-cinematic-border">
          {navCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={cat.link}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-cinematic-text hover:bg-gray-800 border-b border-cinematic-border"
              >
                <Icon size={18} className="text-cinematic-accent" />
                {cat.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiLogOut, FiPackage,
  FiGrid, FiMonitor, FiSmartphone, FiHome, FiTool, FiSmile
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

const categories = [
  { name: 'All', link: '/', icon: FiGrid },
  { name: 'Electronics', link: '/category/Electronics', icon: FiMonitor },
  { name: 'Mobiles', link: '/category/Electronics', icon: FiSmartphone },
  { name: 'Fashion', link: '/category/Fashion', icon: FiUser },
  { name: 'Home', link: '/category/Home', icon: FiHome },
  { name: 'Appliances', link: '/category/Appliances', icon: FiTool },
  { name: 'Beauty', link: '/category/Beauty', icon: FiSmile },
];

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, user, logout } = useApp();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="bg-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-3">
          <Link to="/" className="shrink-0 leading-tight">
            <div className="font-black text-xl tracking-tight">EcoMart</div>
            <div className="text-[10px] text-orange-100 -mt-1">Explore Plus</div>
          </Link>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl">
            <div className="flex w-full bg-white rounded-sm overflow-hidden shadow-sm">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none"
              />
              <button type="submit" className="px-4 text-orange-500 hover:bg-orange-50"><FiSearch size={20} /></button>
            </div>
          </form>

          <nav className="ml-auto flex items-center gap-3 sm:gap-5 text-sm font-semibold">
            <div className="relative">
              <button onClick={() => setShowUserMenu(v => !v)} className="flex items-center gap-1 hover:text-orange-100">
                <FiUser size={19} /> <span className="hidden sm:inline">{user ? user.name || 'Account' : 'Login'}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-9 w-56 bg-white text-gray-800 rounded-sm shadow-xl border z-50">
                  {!user ? (
                    <div className="p-3">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span>New customer?</span>
                        <Link to="/login" onClick={() => setShowUserMenu(false)} className="text-orange-500 font-bold">Sign Up</Link>
                      </div>
                      <Link to="/login" onClick={() => setShowUserMenu(false)} className="block bg-orange-500 text-white text-center py-2 rounded-sm font-bold">Login</Link>
                    </div>
                  ) : (
                    <div className="py-1">
                      <div className="px-4 py-3 border-b">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        <div className="text-xs text-orange-500 mt-1">{user.role}</div>
                      </div>
                      {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-gray-50">Admin Dashboard</Link>}
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-gray-50">My Profile</Link>
                      {!isAdmin && <Link to="/orders" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-gray-50">My Orders</Link>}
                      {!isAdmin && <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 hover:bg-gray-50">Wishlist</Link>}
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2"><FiLogOut /> Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isAdmin && <Link to="/wishlist" className="hidden md:flex items-center gap-1 hover:text-orange-100"><FiHeart /> Wishlist</Link>}
            {user && !isAdmin && <Link to="/orders" className="hidden md:flex items-center gap-1 hover:text-orange-100"><FiPackage /> Orders</Link>}
            {!isAdmin && (
              <Link to="/cart" className="relative flex items-center gap-1 hover:text-orange-100">
                <FiShoppingCart size={20} /> <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && <span className="absolute -top-2 -right-3 bg-yellow-400 text-orange-900 text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-black">{totalItems}</span>}
              </Link>
            )}
            <button className="sm:hidden" onClick={() => setMobileMenuOpen(v => !v)}>{mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </nav>
        </div>
        <form onSubmit={handleSearch} className="sm:hidden px-3 pb-3">
          <div className="flex bg-white rounded-sm overflow-hidden">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products" className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none" />
            <button className="px-3 text-orange-500"><FiSearch /></button>
          </div>
        </form>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-6 overflow-x-auto h-11">
          {categories.map(cat => {
            const Icon = cat.icon;
            return <Link key={cat.name} to={cat.link} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-gray-700 hover:text-orange-500"><Icon size={16} /> {cat.name}</Link>;
          })}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b shadow">
          {user && <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b text-gray-700 font-semibold"><FiUser /> My Profile</Link>}
          {user && !isAdmin && <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b text-gray-700 font-semibold"><FiPackage /> My Orders</Link>}
          {categories.map(cat => {
            const Icon = cat.icon;
            return <Link key={cat.name} to={cat.link} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 border-b text-gray-700"><Icon /> {cat.name}</Link>;
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;




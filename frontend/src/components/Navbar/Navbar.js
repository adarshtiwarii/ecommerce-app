// src/components/Navbar/Navbar.js
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiUser, FiSearch, FiMenu, FiX,
  FiHeart, FiLogOut, FiSettings, FiPackage, FiChevronDown,
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

// Keep nav categories data-driven.
const NAV_CATS = [
  { label: 'For You',        path: '/' },
  { label: 'Electronics',    path: '/category/Electronics' },
  { label: 'Mobiles',        path: '/category/Electronics' },
  { label: 'Fashion',        path: '/category/Fashion' },
  { label: 'Appliances',     path: '/category/Appliances' },
  { label: 'Home & Kitchen', path: '/category/Home' },
  { label: 'Beauty',         path: '/category/Beauty' },
  { label: 'Sports',         path: '/category/Sports' },
  { label: 'Books',          path: '/category/Books' },
  { label: 'Grocery',        path: '/category/Grocery' },
];

const Navbar = () => {
  const [q, setQ]                     = useState('');
  const [userMenu, setUserMenu]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const { totalItems, cart, user, logout, wishlist } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (q.trim()) { navigate(`/search?q=${encodeURIComponent(q.trim())}`); setQ(''); }
  };

  const wishCount = wishlist?.length || 0;
  const cartCount = totalItems || cart?.length || 0;

  return (
    <nav className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-card' : ''}`}
         style={{ background: 'rgba(6,6,6,0.92)', backdropFilter: 'blur(20px) saturate(160%)',
                  borderBottom: '1px solid #1F2937' }}>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                          boxShadow: '0 0 12px rgba(34,197,94,0.30)' }}>
              <img src="/logo.png" alt="" className="w-full h-full object-contain p-0.5"
                   onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:16px">E</span>'; }} />
            </div>
            <div>
              <span className="font-bold text-xl" style={{ fontFamily: 'Syne,system-ui', letterSpacing:'-0.01em' }}>
                <span className="text-eco-green">eco</span>
                <span className="text-eco-text">mart</span>
              </span>
              <p className="text-xs text-eco-muted leading-none" style={{ marginTop: 1 }}>Shop Responsibly</p>
            </div>
          </Link>

          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="flex w-full rounded-full overflow-hidden border border-eco-border
                            focus-within:border-eco-green transition-colors duration-200"
                 style={{ background: '#1F2937' }}>
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className="flex-1 px-5 py-2.5 text-sm text-eco-text placeholder-eco-muted outline-none"
                style={{ background: 'transparent' }}
              />
              <button type="submit" className="px-4 text-eco-green hover:text-white transition-colors">
                <FiSearch size={18} />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Account dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-eco-sub hover:text-eco-text
                           hover:bg-eco-elevated transition-all duration-200 text-sm font-medium"
              >
                {user
                  ? <div className="w-7 h-7 rounded-full bg-eco-green flex items-center justify-center
                                    text-xs font-bold text-white flex-shrink-0">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  : <FiUser size={18} />}
                <span className="hidden sm:inline">{user ? (user.name?.split(' ')[0] || 'Account') : 'Login'}</span>
                <FiChevronDown size={12} className={`hidden sm:inline transition-transform ${userMenu ? 'rotate-180' : ''}`} />
              </button>

              {userMenu && (
                <div className="absolute right-0 top-12 rounded-xl shadow-card border border-eco-border w-56 z-50 overflow-hidden"
                     style={{ background: '#111827' }}>
                  {!user ? (
                    <div className="p-4">
                      <p className="text-xs text-eco-muted mb-3">New to EcoMart?</p>
                      <Link to="/register" onClick={() => setUserMenu(false)}
                            className="block w-full text-center bg-eco-green hover:bg-eco-green-b text-white
                                       py-2.5 rounded-lg text-sm font-semibold mb-2 transition-colors">
                        Create Account
                      </Link>
                      <Link to="/login" onClick={() => setUserMenu(false)}
                            className="block w-full text-center border border-eco-border-g text-eco-green
                                       py-2 rounded-lg text-sm font-medium hover:bg-eco-green-s transition-colors">
                        Login
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-eco-border">
                        <p className="font-semibold text-eco-text text-sm">{user.name}</p>
                        <p className="text-xs text-eco-muted truncate">{user.email}</p>
                        <span className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background:'rgba(34,197,94,0.12)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.25)' }}>
                          {user.role}
                        </span>
                      </div>
                      {[
                        { to: '/profile', icon: FiUser,    label: 'My Profile' },
                        { to: '/orders',  icon: FiPackage, label: 'My Orders'  },
                        { to: '/wishlist',icon: FiHeart,   label: 'Wishlist'   },
                        ...(user.role === 'ADMIN'  ? [{ to:'/admin',  icon:FiSettings, label:'Admin Panel'      }] : []),
                        ...(user.role === 'SELLER' ? [{ to:'/seller', icon:FiSettings, label:'Seller Dashboard' }] : []),
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.to} to={item.to} onClick={() => setUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-eco-sub
                                           hover:bg-eco-elevated hover:text-eco-text transition-colors">
                            <Icon size={14} className="text-eco-green" /> {item.label}
                          </Link>
                        );
                      })}
                      <button onClick={() => { logout(); setUserMenu(false); }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400
                                         hover:bg-eco-elevated w-full transition-colors border-t border-eco-border">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist"
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-eco-sub
                             hover:text-eco-text hover:bg-eco-elevated transition-all duration-200 text-sm font-medium">
              <FiHeart size={18} />
              <span className="hidden sm:inline">Wishlist</span>
              {wishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-eco-red text-white text-xs
                                 rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart"
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium
                             transition-all duration-200 text-sm text-eco-text"
                  style={{ background: cartCount > 0 ? 'rgba(34,197,94,0.12)' : 'transparent',
                           border: cartCount > 0 ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background=cartCount>0?'rgba(34,197,94,0.12)':'transparent'}>
              <FiShoppingCart size={18} className={cartCount > 0 ? 'text-eco-green' : 'text-eco-sub'} />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-eco-green text-white text-xs rounded-full w-5 h-5
                                 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button className="sm:hidden p-2 text-eco-sub hover:text-eco-text transition-colors ml-1"
                    onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch} className="flex rounded-full overflow-hidden border border-eco-border"
                style={{ background: '#1F2937' }}>
            <input type="text" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)}
                   className="flex-1 px-4 py-2 text-sm text-eco-text placeholder-eco-muted outline-none"
                   style={{ background: 'transparent' }} />
            <button type="submit" className="px-3 text-eco-green"><FiSearch size={16} /></button>
          </form>
        </div>
      </div>

      {/* Desktop category strip */}
      <div className="hidden sm:block border-t border-eco-border" style={{ background:'#0B0B0B' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {NAV_CATS.map(cat => (
              <NavLink key={cat.label} to={cat.path}
                       className={({ isActive }) =>
                         `px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                          ${isActive
                            ? 'text-eco-green border-eco-green'
                            : 'text-eco-sub border-transparent hover:text-eco-text hover:border-eco-border'}`
                       }>
                {cat.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-eco-border" style={{ background:'#111827' }}>
          {NAV_CATS.map(cat => (
            <Link key={cat.label} to={cat.path} onClick={() => setMobileOpen(false)}
                  className="flex items-center px-5 py-3.5 text-sm font-medium text-eco-sub
                             hover:bg-eco-elevated hover:text-eco-text border-b border-eco-border transition-colors">
              {cat.label}
            </Link>
          ))}
        </div>
      )}

      {/* Close user menu on outside click */}
      {userMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
      )}
    </nav>
  );
};

export default Navbar;

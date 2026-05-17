import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiHeart, FiHome, FiLogOut, FiMenu, FiMonitor, FiPackage,
  FiSearch, FiShoppingCart, FiSmartphone, FiSmile, FiTool, FiUser, FiX,
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

  const handleSearch = (event) => {
    event.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0D0D0D]/92 text-white shadow-lg backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <Link to="/" className="shrink-0 leading-tight">
          <div className="text-xl font-black tracking-tight">EcoMart</div>
          <div className="-mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF6B00]">PLUS</div>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 sm:flex">
          <div className="mx-auto flex w-full max-w-2xl overflow-hidden rounded-full border border-white/[0.08] bg-[#161616] shadow-sm transition focus-within:border-[#FF6B00] focus-within:shadow-[0_0_0_4px_rgba(255,107,0,0.12)]">
            <input
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search products, brands, deals"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button type="submit" className="px-4 text-[#FF6B00] transition hover:bg-[rgba(255,107,0,0.12)]"><FiSearch size={20} /></button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2 text-sm font-bold sm:gap-3">
          <div className="relative">
            <button onClick={() => setShowUserMenu(value => !value)} className="flex items-center gap-2 rounded-full px-3 py-2 transition hover:bg-white/10">
              <FiUser size={19} /> <span className="hidden sm:inline">{user ? user.name || 'Account' : 'Login'}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-md border border-white/[0.08] bg-[#161616] text-white shadow-2xl">
                {!user ? (
                  <div className="p-4">
                    <p className="text-sm font-bold">New to EcoMart?</p>
                    <p className="mt-1 text-xs text-white/50">Login to manage orders, refunds, wishlist, and delivery addresses.</p>
                    <Link to="/login" onClick={() => setShowUserMenu(false)} className="mt-3 block rounded-full bg-[#FF6B00] py-2.5 text-center font-black text-white">Login / Sign up</Link>
                  </div>
                ) : (
                  <div className="py-1">
                    <div className="border-b px-4 py-3">
                      <div className="font-black">{user.name}</div>
                      <div className="truncate text-xs text-white/50">{user.email}</div>
                      <div className="mt-1 text-xs font-black text-[#FF6B00]">{user.role}</div>
                    </div>
                    {user.role === 'ADMIN' && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 hover:bg-[#161616]">Admin Dashboard</Link>}
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 hover:bg-[#161616]">My Profile</Link>
                    {!isAdmin && <Link to="/orders" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 hover:bg-[#161616]">Orders & Refunds</Link>}
                    {!isAdmin && <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="block px-4 py-2.5 hover:bg-[#161616]">Wishlist</Link>}
                    <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-red-600 hover:bg-red-50"><FiLogOut /> Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isAdmin && <Link to="/wishlist" className="hidden items-center gap-1 rounded-full px-3 py-2 transition hover:bg-white/10 md:flex"><FiHeart /> Wishlist</Link>}
          {user && !isAdmin && <Link to="/orders" className="hidden items-center gap-1 rounded-full px-3 py-2 transition hover:bg-white/10 md:flex"><FiPackage /> Orders</Link>}
          {!isAdmin && (
            <Link to="/cart" className="relative flex items-center gap-1 rounded-full bg-[#FF6B00] px-4 py-2 text-white transition hover:bg-[#E55A00]">
              <FiShoppingCart size={20} /> <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && <span key={totalItems} className="absolute -right-2 -top-1 flex h-5 min-w-5 animate-bounce items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-[#FF6B00]">{totalItems}</span>}
            </Link>
          )}
          <button className="rounded-md p-2 sm:hidden" onClick={() => setMobileMenuOpen(value => !value)}>{mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}</button>
        </nav>
      </div>

      <form onSubmit={handleSearch} className="px-3 pb-3 sm:hidden">
        <div className="flex overflow-hidden rounded-full border border-white/[0.08] bg-[#161616]">
          <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search products" className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40" />
          <button className="px-3 text-[#FF6B00]"><FiSearch /></button>
        </div>
      </form>

      <div className="border-t border-white/10 bg-[#161616]/95">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 overflow-x-auto px-3 sm:px-4">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Link key={category.name} to={category.link} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#161616]/5 px-3 py-1.5 text-xs font-black text-slate-200 transition hover:border-orange-300/40 hover:bg-orange-300/10 hover:text-orange-200">
                <Icon size={15} /> {category.name}
              </Link>
            );
          })}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#0D0D0D] sm:hidden">
          {user && <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 border-b border-white/10 px-4 py-3 font-semibold text-slate-200"><FiUser /> My Profile</Link>}
          {user && !isAdmin && <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 border-b border-white/10 px-4 py-3 font-semibold text-slate-200"><FiPackage /> Orders & Refunds</Link>}
          {categories.map(category => {
            const Icon = category.icon;
            return <Link key={category.name} to={category.link} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 border-b border-white/10 px-4 py-3 text-slate-300"><Icon /> {category.name}</Link>;
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;


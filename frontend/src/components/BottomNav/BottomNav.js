import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiHeart, FiHome, FiPackage, FiUser } from 'react-icons/fi';

const items = [
  { label: 'Home', to: '/', icon: FiHome },
  { label: 'Categories', to: '/search?q=', icon: FiGrid },
  { label: 'Wishlist', to: '/wishlist', icon: FiHeart },
  { label: 'Orders', to: '/orders', icon: FiPackage },
  { label: 'Account', to: '/profile', icon: FiUser },
];

const BottomNav = () => (
  <nav className="fixed inset-x-3 bottom-3 z-50 rounded-full border border-white/[0.08] bg-[#161616]/95 px-2 py-2 shadow-2xl backdrop-blur md:hidden">
    <div className="grid grid-cols-5">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <NavLink key={item.label} to={item.to} className="relative flex flex-col items-center gap-1 rounded-full px-1 py-1.5 text-[10px] font-bold text-white/50">
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="bottom-nav-active" className="absolute inset-0 rounded-full bg-[rgba(255,107,0,0.16)]" />}
                <Icon className={`relative z-10 text-base ${isActive ? 'text-[#FF6B00]' : ''}`} />
                <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;


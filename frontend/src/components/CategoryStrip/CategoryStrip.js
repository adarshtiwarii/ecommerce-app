import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiHome, FiMonitor, FiSmartphone, FiSmile, FiTool, FiUser } from 'react-icons/fi';

const categories = [
  { name: 'All', link: '/', icon: FiGrid },
  { name: 'Electronics', link: '/category/Electronics', icon: FiMonitor },
  { name: 'Mobiles', link: '/category/Electronics', icon: FiSmartphone },
  { name: 'Fashion', link: '/category/Fashion', icon: FiUser },
  { name: 'Home', link: '/category/Home', icon: FiHome },
  { name: 'Appliances', link: '/category/Appliances', icon: FiTool },
  { name: 'Beauty', link: '/category/Beauty', icon: FiSmile },
];

const CategoryStrip = () => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hide-scrollbar flex gap-3 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#161616] p-3">
    {categories.map(category => {
      const Icon = category.icon;
      return (
        <Link key={category.name} to={category.link} className="group flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-[#1E1E1E] px-4 py-2.5 text-sm font-bold text-white/72 transition hover:scale-[1.03] hover:border-[#FF6B00]/60 hover:bg-[rgba(255,107,0,0.12)] hover:text-white">
          <Icon className="transition group-hover:rotate-6 group-hover:text-[#FF6B00]" /> {category.name}
        </Link>
      );
    })}
  </motion.div>
);

export default CategoryStrip;


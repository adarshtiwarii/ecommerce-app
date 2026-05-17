import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronRight,
  FiNavigation,
  FiRefreshCw,
  FiRotateCcw,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import ProductCard from '../components/Product/ProductCard';
import CategoryStrip from '../components/CategoryStrip/CategoryStrip';
import HeroSlider from '../components/HeroSlider/HeroSlider';
import ProductGridSkeleton from '../components/Skeleton/ProductGridSkeleton';
import api from '../utils/api';
import { reverseGeocode } from '../utils/location';

const categoryTiles = [
  { name: 'Electronics', tone: 'from-cyan-500 to-blue-600', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fashion', tone: 'from-fuchsia-500 to-rose-600', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
  { name: 'Home', tone: 'from-orange-500 to-teal-600', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Beauty', tone: 'from-pink-500 to-orange-500', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { name: 'Appliances', tone: 'from-amber-500 to-lime-600', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80' },
];

const Section = ({ title, subtitle, products, link }) => {
  if (!products?.length) return null;
  return (
    <section className="rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        </div>
        <Link to={link || '/search?q='} className="inline-flex items-center gap-1 rounded-full bg-[#0D0D0D] px-4 py-2 text-sm font-black text-white transition hover:bg-orange-600">
          View all <FiChevronRight />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 10).map((p, index) => (
          <motion.div key={p.id || p.productId} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }}>
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentProducts, setRecentProducts] = useState([]);
  const [locationLabel, setLocationLabel] = useState(localStorage.getItem('deliveryLocation') || '');
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/products?page=0&size=80');
        setProducts(res.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Products load nahi ho pa rahe. Backend check karo.');
      } finally {
        setLoading(false);
      }
    };
    load();
    setRecentProducts(JSON.parse(localStorage.getItem('recentProducts') || '[]'));
  }, []);

  const byCategory = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const key = (p.category || 'Other').toLowerCase();
      map[key] = [...(map[key] || []), p];
    });
    return map;
  }, [products]);

  const topDeals = useMemo(() => [...products].sort((a, b) => {
    const da = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
    const db = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
    return db - da;
  }), [products]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Location is not supported in this browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const label = geo.displayName || [geo.city, geo.state, geo.pincode].filter(Boolean).join(', ');
          setLocationLabel(label);
          localStorage.setItem('deliveryLocation', label);
        } catch {
          setLocationLabel('Location detected, address lookup failed.');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setLocationLabel('Location permission denied.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] px-3 py-5 sm:px-4">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="skeleton-shimmer h-[420px] rounded-2xl" />
          <ProductGridSkeleton count={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-4">
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-sm font-black"><FiRefreshCw /> Retry</button>
          </div>
        )}

        <HeroSlider />
        <CategoryStrip />
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#161616] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold">Delivery location</p>
            <p className="mt-1 text-sm text-white/50">{locationLabel || 'Detect your area for delivery estimates.'}</p>
          </div>
          <button onClick={detectLocation} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FF6B00]/30 bg-[rgba(255,107,0,0.12)] px-5 py-3 font-black text-[#FF6B00] transition hover:bg-[#FF6B00] hover:text-white">
            {detectingLocation ? <FiRefreshCw className="animate-spin" /> : <FiNavigation />} Detect location
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm"><FiTruck className="text-orange-600" size={24} /><div><p className="font-black">Fast Delivery</p><p className="text-xs text-white/50">Nearest warehouse ETA</p></div></div>
          <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm"><FiRotateCcw className="text-fuchsia-600" size={24} /><div><p className="font-black">Easy Returns</p><p className="text-xs text-white/50">Refund-aware order flow</p></div></div>
          <div className="flex items-center gap-3 rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm"><FiShield className="text-blue-600" size={24} /><div><p className="font-black">Secure Checkout</p><p className="text-xs text-white/50">JWT and verified payments</p></div></div>
        </div>

        <section className="rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categoryTiles.map(cat => (
              <Link key={cat.name} to={`/category/${cat.name}`} className="group relative min-w-[190px] overflow-hidden rounded-md border border-white/[0.08] bg-[#0D0D0D] text-white">
                <img src={cat.image} alt={cat.name} className="h-28 w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.tone} opacity-70`} />
                <div className="relative flex items-center justify-between p-3 font-black">{cat.name}<FiChevronRight /></div>
              </Link>
            ))}
          </div>
        </section>

        <Section title="Trending Products" subtitle="Popular products customers are checking now" products={products} link="/search?q=" />
        <Section title="Top Deals" subtitle="Highest discounts across all categories" products={topDeals.length ? topDeals : products} link="/search?q=" />
        <Section title="Recently Viewed" subtitle="Products you checked recently" products={recentProducts} link="/search?q=" />
        <Section title="Electronics" subtitle="Mobiles, laptops and gadgets" products={byCategory.electronics || products.slice(0, 10)} link="/category/Electronics" />
        <Section title="Fashion" subtitle="Latest styles and essentials" products={byCategory.fashion} link="/category/Fashion" />
      </div>
    </div>
  );
};

export default HomePage;


import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronRight,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiRotateCcw,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import ProductCard from '../components/Product/ProductCard';
import api from '../utils/api';
import { reverseGeocode } from '../utils/location';

const categoryTiles = [
  { name: 'Electronics', tone: 'bg-blue-50 text-blue-700', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fashion', tone: 'bg-rose-50 text-rose-700', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
  { name: 'Home', tone: 'bg-emerald-50 text-emerald-700', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Beauty', tone: 'bg-pink-50 text-pink-700', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { name: 'Appliances', tone: 'bg-amber-50 text-amber-700', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80' },
];

const Section = ({ title, subtitle, products, link }) => {
  if (!products?.length) return null;
  return (
    <section className="rounded-lg border border-orange-100/70 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Link to={link || '/search?q='} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-orange-600 hover:bg-orange-100">
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
    return <div className="flex min-h-screen items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-4">
        {error && (
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1 text-sm font-black"><FiRefreshCw /> Retry</button>
          </div>
        )}

        <section className="grid gap-4 overflow-hidden rounded-lg border border-orange-100 bg-orange-50/70 p-4 shadow-sm lg:grid-cols-[1.25fr_0.75fr] lg:p-6">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center py-4">
            <p className="text-sm font-black uppercase tracking-wide text-orange-600">Fresh picks, fair prices</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-gray-950 md:text-6xl">
              Shop calm, fast, and made for India.
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-600">
              Minimal browsing, smart delivery estimates, secure payments, and a warm orange shopping experience.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/search?q=" className="rounded-full bg-orange-500 px-6 py-3 text-center font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">Start shopping</Link>
              <button onClick={detectLocation} className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-black text-orange-600 hover:bg-orange-50">
                {detectingLocation ? <FiRefreshCw className="animate-spin" /> : <FiNavigation />} Detect location
              </button>
            </div>
            {locationLabel && <p className="mt-4 inline-flex max-w-2xl items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-gray-600"><FiMapPin className="mt-0.5 shrink-0 text-orange-500" /> {locationLabel}</p>}
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="relative min-h-[280px] overflow-hidden rounded-lg bg-white">
            <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1000&q=80" alt="Modern shopping bags" className="h-full min-h-[280px] w-full object-cover" />
            <div className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-sm font-black text-gray-950">Weekend saver</p>
              <p className="text-xs text-gray-500">Up to 45% off selected essentials</p>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"><FiTruck className="text-orange-500" size={24} /><div><p className="font-black">Fast Delivery</p><p className="text-xs text-gray-500">Nearest warehouse ETA</p></div></div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"><FiRotateCcw className="text-orange-500" size={24} /><div><p className="font-black">Easy Returns</p><p className="text-xs text-gray-500">Simple return requests</p></div></div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"><FiShield className="text-orange-500" size={24} /><div><p className="font-black">Secure Checkout</p><p className="text-xs text-gray-500">JWT and verified payments</p></div></div>
        </div>

        <section className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {categoryTiles.map(cat => (
              <Link key={cat.name} to={`/category/${cat.name}`} className={`group min-w-[170px] overflow-hidden rounded-lg border border-gray-100 ${cat.tone}`}>
                <img src={cat.image} alt={cat.name} className="h-28 w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="flex items-center justify-between p-3 font-black">{cat.name}<FiChevronRight /></div>
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

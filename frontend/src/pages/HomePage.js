import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronRight,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiRotateCcw,
} from 'react-icons/fi';
import Banner from '../components/Home/Banner';
import ProductCard from '../components/Product/ProductCard';
import api from '../utils/api';

const Section = ({ title, subtitle, products, link }) => {
  if (!products?.length) return null;
  return (
    <section className="bg-white rounded-sm shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <Link to={link || '/'} className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-sm flex items-center gap-1">View All <FiChevronRight /></Link>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentProducts, setRecentProducts] = useState([]);

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

  const topDeals = [...products].sort((a, b) => {
    const da = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
    const db = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
    return db - da;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm px-4 py-3 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="text-sm font-bold flex items-center gap-1"><FiRefreshCw /> Retry</button>
          </div>
        )}

        <Banner products={products} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-sm border p-4 flex items-center gap-3"><FiTruck className="text-orange-500" size={24} /><div><p className="font-bold">Fast Delivery</p><p className="text-xs text-gray-500">Free above Rs 400</p></div></div>
          <div className="bg-white rounded-sm border p-4 flex items-center gap-3"><FiRotateCcw className="text-orange-500" size={24} /><div><p className="font-bold">Easy Returns</p><p className="text-xs text-gray-500">7-day return policy</p></div></div>
          <div className="bg-white rounded-sm border p-4 flex items-center gap-3"><FiShield className="text-orange-500" size={24} /><div><p className="font-bold">Secure Checkout</p><p className="text-xs text-gray-500">JWT protected account</p></div></div>
        </div>

        <Section title="Top Deals" subtitle="Highest discounts across all categories" products={topDeals.length ? topDeals : products} link="/search?q=" />
        <Section title="Recently Viewed" subtitle="Products you checked recently" products={recentProducts} link="/search?q=" />
        <Section title="Electronics" subtitle="Mobiles, laptops and gadgets" products={byCategory.electronics || products.slice(0, 10)} link="/category/Electronics" />
        <Section title="Fashion" subtitle="Latest styles and essentials" products={byCategory.fashion} link="/category/Fashion" />
        <Section title="Home & Appliances" subtitle="Upgrade your home" products={[...(byCategory.home || []), ...(byCategory.appliances || [])]} link="/category/Appliances" />
        <Section title="All Products" subtitle={`${products.length} products available`} products={products} link="/search?q=" />
      </div>
    </div>
  );
};

export default HomePage;



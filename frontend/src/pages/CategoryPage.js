import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import ProductGridSkeleton from '../components/Skeleton/ProductGridSkeleton';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/category/${encodeURIComponent(category)}?page=0&size=80`);
        setProducts(res.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch category', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [category]);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-low': return list.sort((a, b) => a.price - b.price);
      case 'price-high': return list.sort((a, b) => b.price - a.price);
      case 'rating': return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount': return list.sort((a, b) => ((b.mrp || b.price) - b.price) - ((a.mrp || a.price) - a.price));
      default: return list;
    }
  }, [products, sortBy]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-[#0D0D0D] py-5">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#161616] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">Category</p>
            <h1 className="font-display text-3xl font-extrabold capitalize text-white">{category}</h1>
            <p className="mt-1 text-sm text-white/50">{sorted.length} products available</p>
          </div>
          <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="rounded-full border border-white/[0.08] bg-[#1E1E1E] px-4 py-3 text-sm text-white outline-none focus:border-[#FF6B00]">
            <option value="relevance">Sort by Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="discount">Discount</option>
          </select>
        </div>
        {loading ? <ProductGridSkeleton count={10} /> : sorted.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-12 text-center text-white/50">No products found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{sorted.map(product => <ProductCard key={product.id || product.productId} product={product} />)}</div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryPage;

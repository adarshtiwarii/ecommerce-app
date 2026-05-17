import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import ProductGridSkeleton from '../components/Skeleton/ProductGridSkeleton';

const priceOptions = [
  ['all', 'All prices'],
  ['0-1000', 'Under Rs 1,000'],
  ['1000-5000', 'Rs 1,000 - Rs 5,000'],
  ['5000-15000', 'Rs 5,000 - Rs 15,000'],
  ['15000-50000', 'Rs 15,000 - Rs 50,000'],
  ['50000-200000', 'Above Rs 50,000'],
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const endpoint = query ? `/products/search?keyword=${encodeURIComponent(query)}&page=0&size=80` : '/products?page=0&size=80';
        const res = await api.get(endpoint);
        setProducts(res.data?.content || []);
      } catch (err) {
        console.error('Search failed', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const results = useMemo(() => {
    let filtered = [...products];
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => Number(product.price || 0) >= min && Number(product.price || 0) <= max);
    }
    if (selectedRating > 0) filtered = filtered.filter(product => Number(product.rating || 4.2) >= selectedRating);
    switch (sortBy) {
      case 'price-low': return filtered.sort((a, b) => a.price - b.price);
      case 'price-high': return filtered.sort((a, b) => b.price - a.price);
      case 'rating': return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount': return filtered.sort((a, b) => ((b.mrp || b.price) - b.price) - ((a.mrp || a.price) - a.price));
      default: return filtered;
    }
  }, [products, sortBy, priceRange, selectedRating]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-[#0D0D0D] py-5">
      <div className="mx-auto flex max-w-7xl gap-4 px-3 sm:px-4">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-32 rounded-2xl border border-white/[0.08] bg-[#161616] p-4">
            <h3 className="mb-4 border-b border-white/[0.08] pb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-white">Filters</h3>
            <div className="mb-5">
              <p className="mb-2 text-sm font-bold text-white">Price</p>
              {priceOptions.map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-white/70"><input type="radio" name="price" checked={priceRange === value} onChange={() => setPriceRange(value)} /> {label}</label>
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-white">Customer Ratings</p>
              {[4, 3, 2, 0].map(rating => <label key={rating} className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-white/70"><input type="radio" name="rating" checked={selectedRating === rating} onChange={() => setSelectedRating(rating)} /> {rating ? `${rating} star & above` : 'All ratings'}</label>)}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#161616] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">Search</p>
              <h1 className="font-display text-2xl font-extrabold text-white">{query ? `Results for "${query}"` : 'All Products'}</h1>
              <p className="mt-1 text-sm text-white/50">{results.length} products found</p>
            </div>
            <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="rounded-full border border-white/[0.08] bg-[#1E1E1E] px-4 py-3 text-sm text-white outline-none focus:border-[#FF6B00]">
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="discount">Discount</option>
            </select>
          </div>
          {loading ? <ProductGridSkeleton count={8} /> : results.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-12 text-center text-white/50">No products found. Try a different keyword or remove filters.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{results.map(product => <ProductCard key={product.id || product.productId} product={product} />)}</div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default SearchPage;

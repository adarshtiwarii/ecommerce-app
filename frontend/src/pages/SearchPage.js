import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';

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
      filtered = filtered.filter(p => Number(p.price || 0) >= min && Number(p.price || 0) <= max);
    }
    if (selectedRating > 0) filtered = filtered.filter(p => Number(p.rating || 4.2) >= selectedRating);
    switch (sortBy) {
      case 'price-low': return filtered.sort((a, b) => a.price - b.price);
      case 'price-high': return filtered.sort((a, b) => b.price - a.price);
      case 'rating': return filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount': return filtered.sort((a, b) => ((b.mrp || b.price) - b.price) - ((a.mrp || a.price) - a.price));
      default: return filtered;
    }
  }, [products, sortBy, priceRange, selectedRating]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex gap-4">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white border rounded-sm shadow-sm p-4 sticky top-28">
            <h3 className="font-bold text-gray-900 uppercase text-sm border-b pb-3 mb-4">Filters</h3>
            <div className="mb-5">
              <p className="font-semibold text-sm mb-2">Price</p>
              {[['all', 'All prices'], ['0-1000', 'Under Rs 1,000'], ['1000-5000', 'Rs 1,000 - Rs 5,000'], ['5000-15000', 'Rs 5,000 - Rs 15,000'], ['15000-50000', 'Rs 15,000 - Rs 50,000'], ['50000-200000', 'Above Rs 50,000']].map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 py-1.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="price" checked={priceRange === value} onChange={() => setPriceRange(value)} /> {label}</label>
              ))}
            </div>
            <div>
              <p className="font-semibold text-sm mb-2">Customer Ratings</p>
              {[4, 3, 2, 0].map(r => <label key={r} className="flex items-center gap-2 py-1.5 text-sm text-gray-700 cursor-pointer"><input type="radio" name="rating" checked={selectedRating === r} onChange={() => setSelectedRating(r)} /> {r ? `${r} star & above` : 'All ratings'}</label>)}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white border rounded-sm shadow-sm p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{query ? `Search results for "${query}"` : 'All Products'}</h1>
              <p className="text-sm text-gray-500">{results.length} products found</p>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-sm px-3 py-2 text-sm bg-white">
              <option value="relevance">Sort by Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="discount">Discount</option>
            </select>
          </div>
          {results.length === 0 ? <div className="bg-white border rounded-sm p-12 text-center text-gray-500">No products found.</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;



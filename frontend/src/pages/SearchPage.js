import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedRating, setSelectedRating] = useState(0);

  useState(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        const res = await api.get(`/products/search?keyword=${encodeURIComponent(query)}&page=0&size=50`);
        setProducts(res.data.content);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const results = useMemo(() => {
    let filtered = products.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (selectedRating > 0) filtered = filtered.filter(p => p.rating >= selectedRating);
    switch (sortBy) {
      case 'price-low': return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-high': return [...filtered].sort((a, b) => b.price - a.price);
      case 'rating': return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'discount': return [...filtered].sort((a, b) => b.discount - a.discount);
      default: return filtered;
    }
  }, [products, sortBy, priceRange, selectedRating]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-cinematic-text text-lg font-bold">Searching...</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-cinematic-card rounded-lg shadow-md p-4 sticky top-20">
              <h3 className="font-bold text-cinematic-text uppercase text-sm mb-4 border-b border-cinematic-border pb-2">Filters</h3>
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-cinematic-text mb-2">Price</h4>
                {[[0,1000],[1000,5000],[5000,15000],[15000,50000],[50000,200000]].map(([min, max]) => (
                  <label key={min} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="radio" name="price" className="accent-cinematic-accent" onChange={() => setPriceRange([min, max])} />
                    <span className="text-sm text-cinematic-text">₹{min.toLocaleString()} - ₹{max.toLocaleString()}</span>
                  </label>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-cinematic-text mb-2">Customer Ratings</h4>
                {[4, 3, 2].map(r => (
                  <label key={r} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="radio" name="rating" className="accent-cinematic-accent" onChange={() => setSelectedRating(r)} />
                    <span className="text-sm text-cinematic-text">{r}★ & above</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="rating" className="accent-cinematic-accent" onChange={() => setSelectedRating(0)} defaultChecked />
                  <span className="text-sm text-cinematic-text">All</span>
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="bg-cinematic-card rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
              <p className="text-cinematic-text">
                Results for "<span className="font-bold text-cinematic-accent">{query}</span>" <span className="text-cinematic-text-muted">({results.length})</span>
              </p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-gray-800 border border-cinematic-border rounded-lg px-3 py-1.5 text-sm text-cinematic-text focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="discount">Discount</option>
              </select>
            </div>
            {results.length === 0 ? (
              <div className="bg-cinematic-card rounded-lg p-12 text-center">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-cinematic-text font-medium">No products found for "{query}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
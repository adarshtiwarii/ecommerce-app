import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/products/category/${category}?page=0&size=50`);
        setProducts(res.data.content);
      } catch (err) {
        console.error('Failed to fetch category', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [category]);

  const filtered = [...products];
  switch (sortBy) {
    case 'price-low': filtered.sort((a,b)=>a.price-b.price); break;
    case 'price-high': filtered.sort((a,b)=>b.price-a.price); break;
    case 'rating': filtered.sort((a,b)=>b.rating-a.rating); break;
    case 'discount': filtered.sort((a,b)=>b.discount-a.discount); break;
    default: break;
  }

  if (loading) return <div className="flex justify-center items-center min-h-screen text-cinematic-text text-lg font-bold">Loading products...</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-cinematic-card rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cinematic-text capitalize">
            {category} <span className="text-cinematic-text-muted text-sm font-normal">({filtered.length} items)</span>
          </h1>
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
        {filtered.length === 0 ? (
          <div className="bg-cinematic-card rounded-lg p-12 text-center">
            <p className="text-4xl mb-2">📦</p>
            <p className="text-cinematic-text font-medium">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
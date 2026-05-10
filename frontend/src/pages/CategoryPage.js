import { useEffect, useMemo, useState } from 'react';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white border rounded-sm shadow-sm p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{category}</h1>
            <p className="text-sm text-gray-500">{sorted.length} products available</p>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-sm px-3 py-2 text-sm bg-white">
            <option value="relevance">Sort by Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="discount">Discount</option>
          </select>
        </div>
        {sorted.length === 0 ? <div className="bg-white border rounded-sm p-12 text-center text-gray-500">No products found in this category.</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{sorted.map(p => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
    </div>
  );
};

export default CategoryPage;



import { useState, useEffect } from 'react';
import Banner from '../components/Home/Banner';
import ProductCard from '../components/Product/ProductCard';
import api from '../utils/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?page=0&size=20');
        setProducts(res.data.content);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-cinematic-text">Loading amazing products...</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Banner – already has its own styling */}
        <Banner />

        {/* Products Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-cinematic-text mb-4">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
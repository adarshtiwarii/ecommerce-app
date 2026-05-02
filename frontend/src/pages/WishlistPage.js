import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';

const WishlistPage = () => {
  const { wishlist } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) { setLoading(false); return; }
      try {
        const promises = wishlist.map(id => api.get(`/products/${id}`));
        const responses = await Promise.all(promises);
        setProducts(responses.map(r => r.data));
      } catch (err) {
        console.error('Failed to fetch wishlist products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-cinematic-text text-lg font-bold">Loading your wishlist...</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-cinematic-text mb-6">My Wishlist ({products.length})</h1>
        {products.length === 0 ? (
          <div className="bg-cinematic-card rounded-lg p-12 text-center">
            <FiHeart size={64} className="text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cinematic-text mb-2">Your wishlist is empty</h3>
            <p className="text-cinematic-text-muted mb-6">Save items you love here</p>
            <Link to="/" className="inline-block bg-cinematic-accent hover:opacity-90 text-white font-bold px-8 py-3 rounded-lg transition">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
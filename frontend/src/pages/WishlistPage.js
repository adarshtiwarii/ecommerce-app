import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import ProductCard from '../components/Product/ProductCard';
import ProductGridSkeleton from '../components/Skeleton/ProductGridSkeleton';

const WishlistPage = () => {
  const { wishlist } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const responses = await Promise.all(wishlist.map(id => api.get(`/products/${id}`)));
        setProducts(responses.map(response => response.data));
      } catch (err) {
        console.error('Failed to fetch wishlist products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [wishlist]);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen bg-[#0D0D0D] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-6 flex items-center gap-2 font-display text-3xl font-extrabold text-white">
          <FiHeart className="text-[#FF6B00]" size={28} />
          My Wishlist ({products.length})
        </h1>

        {loading ? <ProductGridSkeleton count={8} /> : products.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-white/[0.08] bg-[#161616] p-12 text-center">
            <FiHeart size={64} className="mx-auto mb-4 text-[#FF6B00]/50" />
            <h3 className="font-display text-2xl font-bold text-white">Your wishlist is empty</h3>
            <p className="mb-6 mt-2 text-white/50">Save items you love here.</p>
            <Link to="/" className="inline-block rounded-full bg-[#FF6B00] px-8 py-3 font-bold text-white transition hover:bg-[#E55A00]">Start Shopping</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map(product => <ProductCard key={product.id || product.productId} product={product} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WishlistPage;

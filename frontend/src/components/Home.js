import React from 'react';
import ProductGrid from './product/ProductGrid';
import { FaShoppingCart, FaBoxOpen, FaClipboardList } from 'react-icons/fa';

const Home = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const userName = localStorage.getItem('userName') || 'User';

  React.useEffect(() => {
    fetch('http://localhost:8080/api/products?page=0&size=20')
      .then(res => res.json())
      .then(data => { setProducts(data.content); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black">
      {/* Hero Section */}
      <div className="text-center py-20 px-4">
        <FaShoppingCart className="text-6xl neon-text mx-auto mb-4" />
        <h1 className="text-5xl md:text-6xl font-light text-white">
          Welcome back, <span className="neon-text">{userName}</span>!
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-4">
          Discover amazing products, manage orders, and enjoy seamless shopping.
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <ProductGrid products={products} loading={loading} />
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 text-center">
          <FaBoxOpen className="text-4xl neon-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Wide Selection</h3>
        </div>
        <div className="glass-card p-6 text-center">
          <FaClipboardList className="text-4xl neon-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Easy Orders</h3>
        </div>
        <div className="glass-card p-6 text-center">
          <FaShoppingCart className="text-4xl neon-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Secure Payments</h3>
        </div>
      </div>
    </div>
  );
};

export default Home;
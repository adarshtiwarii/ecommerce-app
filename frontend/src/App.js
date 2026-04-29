// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProductGrid from './components/product/ProductGrid';
import ProductDetail from './components/product/ProductDetail';
import ProductFilter from './components/product/ProductFilter';
import Cart from './components/cart/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import SellerDashboard from './components/seller/SellerDashboard';
import Profile from './components/user/Profile';
import Home from './components/Home';
import AddProduct from './components/AddProduct';          // ✅ import AddProduct
import ProtectedRoute from './components/ProtectedRoute';
import Logout from './components/Logout';

// ProductListing component (with filter, used for "/" and "/search")
const ProductListing = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({ category: null, minPrice: null, maxPrice: null });

  React.useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        params.append('page', '0');
        params.append('size', '20');

        const response = await fetch(`http://localhost:8080/api/products/filter?${params.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setProducts(data.content || []);
      } catch (err) {
        console.error('Filter error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <ProductFilter onFilter={setFilters} />
        </div>
        <div className="md:w-3/4">
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter basename="/ecommerce-app">
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ProductListing />} />
          <Route path="/search" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

          {/* Add Product (accessible by ADMIN and SELLER) */}
          <Route path="/add-product" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
              <AddProduct />
            </ProtectedRoute>
          } />

          {/* Role-based dashboards */}
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/seller/*" element={<ProtectedRoute allowedRoles={['SELLER','ADMIN']}><SellerDashboard /></ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
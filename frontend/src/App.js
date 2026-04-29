// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProductDetail from './components/product/ProductDetail';
import Cart from './components/cart/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import SellerDashboard from './components/seller/SellerDashboard';
import Profile from './components/user/Profile';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Logout from './components/Logout';
import ProductListingPage from './pages/ProductListingPage';   // ✅ new import

function App() {
  return (
    <CartProvider>
      <BrowserRouter basename="/ecommerce-app">
        <Navbar />
        <Routes>
          {/* Public routes - product listing now uses dedicated page */}
          <Route path="/" element={<ProductListingPage />} />
          <Route path="/search" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />

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
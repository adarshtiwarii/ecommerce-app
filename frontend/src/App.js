// src/App.js
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Layout
import Navbar       from './components/Navbar/Navbar';
import Footer       from './components/common/Footer';
import SplashScreen from './components/common/SplashScreen';
import BottomNav    from './components/BottomNav/BottomNav';

// Pages
import HomePage          from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage          from './pages/CartPage';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import SearchPage        from './pages/SearchPage';
import CategoryPage      from './pages/CategoryPage';
import WishlistPage      from './pages/WishlistPage';
import CheckoutPage      from './pages/CheckoutPage';
import AdminDashboard    from './pages/AdminDashboard';
import OrdersPage        from './pages/OrdersPage';

// Components
import Profile        from './components/user/Profile';
import AddProduct     from './components/AddProduct';
import EditProduct    from './components/EditProduct';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Logout handler ─────────────────────────────────────────
// AppContext mein useNavigate nahi chalta (BrowserRouter ke bahar hota hai)
// isliye custom event use karte hain
const LogoutHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = () => navigate('/login', { replace: true });
    window.addEventListener('app-logout', handle);
    return () => window.removeEventListener('app-logout', handle);
  }, [navigate]);

  return null;
};

// ── Guest Guard — already logged in toh home pe bhejo ─────
const GuestRoute = ({ children }) => {
  const { user } = useApp();
  return user ? <Navigate to="/" replace /> : children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// ── All routes ─────────────────────────────────────────────
const AppRoutes = () => (
  <>
    <LogoutHandler />
    <ScrollToTop />
    <div className="flex min-h-screen flex-col bg-[#0D0D0D] pb-20 text-white md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Routes>

          {/* ── PUBLIC — bina login ke bhi open honge ─── */}
          <Route path="/"                  element={<HomePage />} />
          <Route path="/product/:id"       element={<ProductDetailPage />} />
          <Route path="/search"            element={<SearchPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />

          {/* ── AUTH — already logged in toh / pe redirect ── */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* ── PROTECTED — login zaroori ──────────────── */}
          <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* ── ADMIN ONLY ─────────────────────────────── */}
          <Route path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/add-product"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/edit-product/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          {/* ── 404 — sab unknown routes home pe ──────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  </>
);

// ── Root App ───────────────────────────────────────────────
function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/ecommerce-app' : ''}>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </BrowserRouter>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default App;






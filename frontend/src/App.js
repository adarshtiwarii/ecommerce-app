import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/common/Footer';
import SplashScreen from './components/common/SplashScreen';
import BottomNav from './components/BottomNav/BottomNav';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import OrdersPage from './pages/OrdersPage';
import Profile from './components/user/Profile';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ROUTES } from './constants/routes';

const LogoutHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = () => navigate(ROUTES.LOGIN, { replace: true });
    window.addEventListener('app-logout', handle);
    return () => window.removeEventListener('app-logout', handle);
  }, [navigate]);

  return null;
};

const GuestRoute = ({ children }) => {
  const { user } = useApp();
  return user ? <Navigate to={ROUTES.HOME} replace /> : children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const AppRoutes = () => (
  <>
    <LogoutHandler />
    <ScrollToTop />
    <div className="flex min-h-screen flex-col bg-[var(--bg-main)] pb-20 text-[var(--text-primary)] md:pb-0">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path={ROUTES.PRODUCTS} element={<SearchPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path={ROUTES.LOGIN} element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path={ROUTES.REGISTER} element={<GuestRoute><LoginPage initialMode="register" /></GuestRoute>} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><LoginPage initialMode="forgot" /></GuestRoute>} />
          <Route path={ROUTES.CART} element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path={ROUTES.WISHLIST} element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path={ROUTES.ORDERS} element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path={ROUTES.ADD_PRODUCT} element={<ProtectedRoute allowedRoles={['ADMIN']}><AddProduct /></ProtectedRoute>} />
          <Route path="/edit-product/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><EditProduct /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
    </div>
  </>
);

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" />
      ) : (
        <motion.div key="app" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <BrowserRouter>
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

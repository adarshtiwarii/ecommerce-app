import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar/Navbar';
import BottomNav from './components/BottomNav/BottomNav';
import Footer from './components/common/Footer';
import SplashScreen from './components/common/SplashScreen';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import Profile from './components/user/Profile';
import { ROUTES } from './constants/routes';

const BACKEND_URL = 'https://ecommerce-app-rttb.onrender.com';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Keep the Render backend warm while the frontend is open.
  useEffect(() => {
    const ping = () => {
      fetch(`${BACKEND_URL}/api/health`).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <div className="min-h-screen flex flex-col bg-eco-bg text-eco-text">
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">
            <Routes>
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.PRODUCTS} element={<SearchPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<LoginPage initialMode="forgot" />} />
              <Route path={ROUTES.CART} element={<CartPage />} />
              <Route
                path={ROUTES.CHECKOUT}
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ORDERS}
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.WISHLIST}
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seller"
                element={
                  <ProtectedRoute allowedRoles={['SELLER']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADD_PRODUCT}
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-product/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

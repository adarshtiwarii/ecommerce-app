import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';

const AppContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter(item => item.productId !== action.payload) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
        return { ...state, cart: state.cart.filter(item => item.productId !== action.payload.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
};

const authStorage = () => (localStorage.getItem('token') ? localStorage : sessionStorage);

const clearAuthStorage = () => {
  ['token', 'userEmail', 'userName', 'userRole', 'userId'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] });
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storage = authStorage();
    const token = storage.getItem('token');
    const email = storage.getItem('userEmail');
    const role = storage.getItem('userRole');
    const name = storage.getItem('userName');
    const userId = storage.getItem('userId');

    if (token && email && userId) {
      const numericUserId = Number(userId);
      setUser({ email, role, name, id: numericUserId });
      api.get(`/cart?userId=${numericUserId}`)
        .then(res => dispatch({ type: 'SET_CART', payload: res.data }))
        .catch(err => console.error('Failed to load cart', err));
    }
  }, []);

  const login = async (emailOrPhone, password, rememberMe = true) => {
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password, rememberMe });
      const { token, email, fullName, role, userId } = res.data;
      const storage = rememberMe ? localStorage : sessionStorage;

      clearAuthStorage();
      storage.setItem('token', token);
      storage.setItem('userEmail', email);
      storage.setItem('userName', fullName);
      storage.setItem('userRole', role);
      storage.setItem('userId', String(userId));

      const numericUserId = Number(userId);
      setUser({ email, role, name: fullName, id: numericUserId });
      const cartRes = await api.get(`/cart?userId=${numericUserId}`);
      dispatch({ type: 'SET_CART', payload: cartRes.data });
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err.response?.data);
      return { success: false, message: getErrorMessage(err, 'Invalid email/phone or password') };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err.response?.data);
      return { success: false, message: getErrorMessage(err, 'Registration failed. Please try again.') };
    }
  };

  const requestPasswordReset = async (emailOrPhone) => {
    try {
      const res = await api.post('/profile/forgot-password', { emailOrPhone });
      return {
        success: true,
        message: res.data?.message || 'Reset instructions generated.',
        emailSent: !!res.data?.emailSent,
        devResetToken: res.data?.devResetToken || '',
      };
    } catch (err) {
      return { success: false, message: getErrorMessage(err, 'Unable to start password reset') };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.post('/profile/reset-password', { token, newPassword });
      return { success: true, message: res.data?.message || 'Password reset successfully' };
    } catch (err) {
      return { success: false, message: getErrorMessage(err, 'Unable to reset password') };
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    dispatch({ type: 'CLEAR_CART' });
    window.dispatchEvent(new Event('app-logout'));
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    if (user.role === 'ADMIN') {
      alert('Admin accounts cannot add products to cart');
      return;
    }
    const productId = product.productId || product.id;
    if (!productId) {
      console.error('Product ID missing:', product);
      return;
    }
    try {
      await api.post(`/cart/add?userId=${user.id}&productId=${productId}&quantity=${quantity}`);
      const updatedCart = await api.get(`/cart?userId=${user.id}`);
      dispatch({ type: 'SET_CART', payload: updatedCart.data });
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert(getErrorMessage(err, 'Failed to add item'));
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await api.delete(`/cart/remove?userId=${user.id}&productId=${productId}`);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (err) {
      console.error('Failed to remove', err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    if (!productId) {
      console.error('productId is undefined in updateQuantity');
      return;
    }
    try {
      await api.put(`/cart/update?userId=${user.id}&productId=${productId}&quantity=${quantity}`);
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete(`/cart/clear?userId=${user.id}`);
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const updateUser = (patch) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...patch };
      const storage = authStorage();
      if (next.email) storage.setItem('userEmail', next.email);
      if (next.name) storage.setItem('userName', next.name);
      if (next.role) storage.setItem('userRole', next.role);
      if (next.id) storage.setItem('userId', String(next.id));
      return next;
    });
  };

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider value={{
      user, login, register, logout, requestPasswordReset, resetPassword,
      updateUser,
      wishlist, toggleWishlist, isWishlisted,
      cart: state.cart, addToCart, removeFromCart,
      updateQuantity, clearCart, totalItems, totalPrice,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

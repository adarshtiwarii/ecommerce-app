// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../utils/api';

const AppContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_ITEM': {
      const existing = state.cart.find(i => i.productId === action.payload.productId);
      let newCart;
      if (existing) {
        newCart = state.cart.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      } else {
        newCart = [...state.cart, action.payload];
      }
      return { ...state, cart: newCart };
    }
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter(i => i.productId !== action.payload) };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity === 0) {
        return { ...state, cart: state.cart.filter(i => i.productId !== action.payload.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] });
  const [user,     setUser]     = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // ── Page reload pe user + cart restore ──────────────────
  useEffect(() => {
    const token  = localStorage.getItem('token');
    const email  = localStorage.getItem('userEmail');
    const role   = localStorage.getItem('userRole');
    const name   = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (token && email && userId) {
      const numericUserId = Number(userId);
      setUser({ email, role, name, id: numericUserId });

      api.get(`/cart?userId=${numericUserId}`)
        .then(res => dispatch({ type: 'SET_CART', payload: res.data }))
        .catch(err => console.error('Failed to load cart', err));
    }
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = async (emailOrPhone, password) => {
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password });
      const { token, email, fullName, role, userId } = res.data;

      localStorage.setItem('token',     token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName',  fullName);
      localStorage.setItem('userRole',  role);
      localStorage.setItem('userId',    String(userId));

      const numericUserId = Number(userId);
      setUser({ email, role, name: fullName, id: numericUserId });

      const cartRes = await api.get(`/cart?userId=${numericUserId}`);
      dispatch({ type: 'SET_CART', payload: cartRes.data });

      return { success: true };
    } catch (err) {
      console.error('Login failed:', err.response?.data);

      // ✅ Exact backend error message return karo
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        'Invalid email/phone or password';

      return { success: false, message };
    }
  };

  // ── Register ─────────────────────────────────────────────
  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err.response?.data);

      // ✅ Backend ka exact error message capture karo
      const message =
        err.response?.data?.message ||          // { message: "Email already exists" }
        err.response?.data?.error ||            // { error: "Bad Request" }
        (typeof err.response?.data === 'string' // plain string response
          ? err.response.data
          : null) ||
        'Registration failed. Please try again.';

      return { success: false, message };
    }
  };

  // ── Logout ───────────────────────────────────────────────
  // AppContext.js mein sirf logout function badlo
const logout = () => {
  localStorage.clear();
  setUser(null);
  dispatch({ type: 'CLEAR_CART' });
  // ✅ Custom event fire karo — LogoutHandler sun ke /login pe navigate karega
  window.dispatchEvent(new Event('app-logout'));
};

  // ── Add to Cart ──────────────────────────────────────────
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
      alert(err.response?.data || 'Failed to add item');
    }
  };

  // ── Remove from Cart ─────────────────────────────────────
  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await api.delete(`/cart/remove?userId=${user.id}&productId=${productId}`);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (err) {
      console.error('Failed to remove', err);
    }
  };

  // ── Update Quantity ──────────────────────────────────────
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

  // ── Clear Cart ───────────────────────────────────────────
  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete(`/cart/clear?userId=${user.id}`);
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  // ── Wishlist ─────────────────────────────────────────────
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  const updateUser = (patch) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...patch };
      if (next.email) localStorage.setItem('userEmail', next.email);
      if (next.name) localStorage.setItem('userName', next.name);
      if (next.role) localStorage.setItem('userRole', next.role);
      if (next.id) localStorage.setItem('userId', String(next.id));
      return next;
    });
  };

  // ── Cart totals ──────────────────────────────────────────
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider value={{
      user, login, register, logout,
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

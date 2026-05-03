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
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // ✅ Page reload pe user aur cart restore karo
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (token && email && userId) {
      const numericUserId = Number(userId); // ✅ String → Number
      setUser({ email, role, name, id: numericUserId });

      // ✅ Cart load karo
      api.get(`/cart?userId=${numericUserId}`)
        .then(res => dispatch({ type: 'SET_CART', payload: res.data }))
        .catch(err => console.error('Failed to load cart', err));
    }
  }, []);

  // ✅ Login
  const login = async (emailOrPhone, password) => {
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password });
      const { token, email, fullName, role, userId } = res.data;

      // ✅ Token aur user data save karo
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', String(userId));

      const numericUserId = Number(userId); // ✅ Number rakho
      setUser({ email, role, name: fullName, id: numericUserId });

      // ✅ Login ke baad cart load karo
      const cartRes = await api.get(`/cart?userId=${numericUserId}`);
      dispatch({ type: 'SET_CART', payload: cartRes.data });

      return true;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  // ✅ Register
  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return true;
    } catch (err) {
      console.error('Registration failed', err);
      return false;
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    dispatch({ type: 'CLEAR_CART' });
    window.location.href = '/login';
  };

  // ✅ Cart me item add karo
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    // ✅ FIX — productId sahi field se lo
    const productId = product.productId || product.id;

    if (!productId) {
      console.error('Product ID missing:', product);
      return;
    }

    try {
      await api.post(`/cart/add?userId=${user.id}&productId=${productId}&quantity=${quantity}`);
      // ✅ Backend se fresh cart lo
      const updatedCart = await api.get(`/cart?userId=${user.id}`);
      dispatch({ type: 'SET_CART', payload: updatedCart.data });
    } catch (err) {
      console.error('Failed to add to cart', err);
      alert(err.response?.data || 'Failed to add item');
    }
  };

  // ✅ Cart se item remove karo
  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await api.delete(`/cart/remove?userId=${user.id}&productId=${productId}`);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });
    } catch (err) {
      console.error('Failed to remove', err);
    }
  };

  // ✅ Quantity update karo
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

  // ✅ Cart clear karo
  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete(`/cart/clear?userId=${user.id}`);
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  // ✅ Wishlist
  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  // ✅ Cart totals
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        wishlist,
        toggleWishlist,
        isWishlisted,
        cart: state.cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
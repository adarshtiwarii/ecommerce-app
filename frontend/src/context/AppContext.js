import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../utils/api';

const AppContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'ADD_ITEM': {
      const existing = state.cart.find(i => i.id === action.payload.id);
      let newCart;
      if (existing) {
        newCart = state.cart.map(i =>
          i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newCart = [...state.cart, { ...action.payload, quantity: 1 }];
      }
      return { ...state, cart: newCart };
    }
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter(i => i.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
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

  // Load user & cart from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (token && email) {
      setUser({ email, role, name });
    }
    const savedCart = localStorage.getItem('cart');
    if (savedCart) dispatch({ type: 'SET_CART', payload: JSON.parse(savedCart) });
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
  }, [state.cart]);

  const login = async (emailOrPhone, password) => {
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password });
      const { token, email, fullName, role, userId } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', userId);
      setUser({ email, role, name: fullName });
      return true;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return true;
    } catch (err) {
      console.error('Registration failed', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    dispatch({ type: 'CLEAR_CART' });
    window.location.href = '/login';
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  // Cart actions
  const addToCart = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const totalItems = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
// src/utils/auth.js

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const isAuthenticated = () => !!getToken();

export const getUserRole = () => localStorage.getItem('userRole');

export const getUserId = () => localStorage.getItem('userId');
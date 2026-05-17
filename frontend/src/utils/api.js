import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data || error.response?.statusText || '';

    // ✅ Account deactivated — 403
    if (error.response?.status === 403 && String(message).toLowerCase().includes('deactivated')) {
      localStorage.clear();
      window.dispatchEvent(new Event('app-logout'));
      window.dispatchEvent(new CustomEvent('app-auth-error', {
        detail: 'Your account is deactivated. Please contact the admin.',
      }));
    }

    // ✅ Token expired / version mismatch — 401
    if (error.response?.status === 401) {
      localStorage.clear();
      window.dispatchEvent(new Event('app-logout'));
    }

    return Promise.reject(error);
  }
);

export default api;
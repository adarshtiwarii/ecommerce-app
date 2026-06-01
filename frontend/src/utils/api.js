import axios from 'axios';

const DEFAULT_API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://ecommerce-app-rttb.onrender.com/api';

const configuredApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
const isLocalBrowser = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL =
  !isLocalBrowser && configuredApiBaseUrl?.includes('localhost')
    ? DEFAULT_API_BASE_URL
    : configuredApiBaseUrl || DEFAULT_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ─── FIX: Cache GET requests for 60 seconds ───
    // After deploy on Render, every product page made 2 API calls and was slow.
    // This tells the browser to cache GET responses for 60 seconds.
    // So if user visits same product twice within 1 minute, second load is instant.
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'max-age=60';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data || error.response?.statusText || '';

    if (error.response?.status === 403 && String(message).toLowerCase().includes('deactivated')) {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event('app-logout'));
      window.dispatchEvent(new CustomEvent('app-auth-error', {
        detail: 'Your account is deactivated. Please contact the admin.',
      }));
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event('app-logout'));
    }

    return Promise.reject(error);
  }
);

export default api;

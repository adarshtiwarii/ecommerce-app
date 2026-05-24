export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_PRODUCTS: '/admin',
  ADMIN_ORDERS: '/admin',
  ADMIN_USERS: '/admin',
  ADMIN_ANALYTICS: '/admin',
  ADMIN_SETTINGS: '/admin',
  ADD_PRODUCT: '/add-product',
};

export const ROUTE = {
  product: (id) => `/product/${id}`,
  category: (category) => `/category/${encodeURIComponent(category)}`,
  order: (id) => `/orders/${id}`,
  adminOrder: (id) => `/admin/orders/${id}`,
  editProduct: (id) => `/edit-product/${id}`,
  search: (query = '') => `/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
};

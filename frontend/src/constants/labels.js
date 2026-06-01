import { ROUTES } from './routes';

export const BRAND = {
  name: 'EcoMart',
  prefix: 'Eco',
  suffix: 'Mart',
  nameEco: 'Eco',
  nameMart: 'Mart',
  logo_icon: 'E',
  tagline: 'Discover. Shop. Enjoy.',
  loadingText: 'LOADING EXPERIENCE...',
};

export const UI_TEXT = {
  retry: 'Retry',
  viewAll: 'View all',
  goHome: 'Go home',
  loginOrSignup: 'Login / Sign up',
  adminDashboard: 'Admin Dashboard',
  logout: 'Logout',
  searchPlaceholder: 'Search products, brands, deals',
  mobileSearchPlaceholder: 'Search products',
  authNewUser: 'New to EcoMart?',
  authMenuSub: 'Login to manage orders, refunds, wishlist, and addresses.',
  adminMode: 'Admin mode',
  adminCartSub: 'Cart and checkout are available only for customer accounts.',
  priceDetails: 'Price Details',
  checkout: 'Checkout',
  continueShopping: 'Continue Shopping',
  remove: 'Remove',
  moveToWishlist: 'Move to Wishlist',
  safePayments: 'Safe and secure payments',
  fastDelivery: 'Fast delivery on available items',
};

export const AUTH_TEXT = {
  loginTitle: 'Welcome Back',
  registerTitle: 'Join EcoMart',
  forgotTitle: 'Reset Password',
  loginSub: 'Sign in to manage orders, carts, and deals.',
  registerSub: 'Create your marketplace account in seconds.',
  forgotSub: 'Generate a reset token, then set a new password.',
  login: 'Login',
  register: 'Register',
  createAccount: 'Create Account',
  rememberMe: 'Remember me',
  forgotPassword: 'Forgot Password?',
  backToLogin: 'Back to Login',
  resetPassword: 'Reset Password',
  sendReset: 'Generate Reset Token',
  resetToken: 'Reset token',
  devResetToken: 'Development reset token',
  agreePrefix: 'By continuing, you agree to EcoMart terms and privacy policy.',
  noAccount: "Don't have an account?",
  hasAccount: 'Already have an account?',
  email: 'Email Address',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  fullName: 'Full Name',
  phone: 'Phone Number',
  gender: 'Select Gender',
  loadingLogin: 'Logging in...',
  loadingRegister: 'Creating account...',
  loadingReset: 'Resetting password...',
  loadingToken: 'Generating token...',
};

export const AUTH_GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const USER_NAV = [
  { key: 'home', label: 'Home', route: ROUTES.HOME, icon: 'home' },
  { key: 'orders', label: 'Orders', route: ROUTES.ORDERS, icon: 'orders' },
  { key: 'wishlist', label: 'Wishlist', route: ROUTES.WISHLIST, icon: 'wishlist' },
  { key: 'cart', label: 'Cart', route: ROUTES.CART, icon: 'cart' },
  { key: 'profile', label: 'Profile', route: ROUTES.PROFILE, icon: 'profile' },
];

export const EMPTY_STATES = {
  cart:        { icon: 'cart',   title: 'Your cart is empty',        sub: 'Add products to get started' },
  orders:      { icon: 'box',    title: 'No orders yet',             sub: 'Your order history will appear here' },
  wishlist:    { icon: 'heart',  title: 'Nothing saved yet',         sub: 'Tap the heart on products you love' },
  products:    { icon: 'search', title: 'No products found',         sub: 'Try a different search or filter' },
  adminOrders: { icon: 'list',   title: 'No orders found',           sub: 'Orders appear here once placed' },
  adminUsers:  { icon: 'users',  title: 'No users found',            sub: 'Registered users appear here' },
  search:      { icon: 'search', title: 'No results for this search', sub: 'Try different keywords' },
};

export const STATUS_CONFIG = {
  PENDING:          { label: 'Pending',          color: 'var(--warning-bright)', bg: 'var(--warning-bg)', dot: true },
  CONFIRMED:        { label: 'Confirmed',         color: 'var(--info-bright)',    bg: 'var(--info-bg)',    dot: true },
  PROCESSING:       { label: 'Processing',        color: 'var(--primary)',        bg: 'var(--primary-subtle)', dot: true },
  SHIPPED:          { label: 'Shipped',           color: 'var(--info-bright)',    bg: 'var(--info-bg)',    dot: true },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',  color: 'var(--info-bright)',    bg: 'var(--info-bg)',    dot: true },
  DELIVERED:        { label: 'Delivered',         color: 'var(--success-bright)', bg: 'var(--success-bg)', dot: true },
  CANCELLED:        { label: 'Cancelled',         color: 'var(--error-bright)',   bg: 'var(--error-bg)',   dot: true },
  RETURN_REQUESTED: { label: 'Return Requested',  color: 'var(--warning-bright)', bg: 'var(--warning-bg)', dot: true },
  RETURNED:         { label: 'Returned',          color: 'var(--text-secondary)', bg: 'var(--bg-overlay)', dot: true },
};

export const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'Razorpay', desc: 'UPI, cards, EMI, net banking and QR', icon: 'bolt', badge: 'Recommended' },
  { id: 'cod',      label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: 'cash', badge: '' },
];

export const ADMIN_STAT_CONFIG = {
  orders:   { icon: 'box',    color: 'var(--primary)',        bg: 'var(--primary-subtle)', label: 'Total Orders' },
  revenue:  { icon: 'rupee',  color: 'var(--success-bright)', bg: 'var(--success-bg)',     label: 'Total Revenue' },
  users:    { icon: 'user',   color: 'var(--info-bright)',    bg: 'var(--info-bg)',         label: 'Registered Users' },
  products: { icon: 'bag',    color: 'var(--warning-bright)', bg: 'var(--warning-bg)',      label: 'Active Products' },
};

export const ADMIN_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid',     route: ROUTES.ADMIN_DASHBOARD },
  { key: 'orders',    label: 'Orders',    icon: 'box',      route: ROUTES.ADMIN_ORDERS },
  { key: 'products',  label: 'Products',  icon: 'bag',      route: ROUTES.ADMIN_PRODUCTS },
  { key: 'users',     label: 'Users',     icon: 'users',    route: ROUTES.ADMIN_USERS },
  { key: 'analytics', label: 'Analytics', icon: 'chart',    route: ROUTES.ADMIN_ANALYTICS },
  { key: 'settings',  label: 'Settings',  icon: 'settings', route: ROUTES.ADMIN_SETTINGS },
];

export const ORDER_STATUS_OPTIONS = Object.keys(STATUS_CONFIG);

export const CHECKOUT_STEPS = [
  { n: 1, label: 'Delivery' },
  { n: 2, label: 'Payment' },
];

export const CHECKOUT_LABELS = {
  step1Title:      'Delivery Address',
  step1Sub:        'Where should we deliver?',
  step2Title:      'Payment Method',
  step2Sub:        'Safe and encrypted checkout',
  detectBtn:       'Use My Current Location',
  detectLoading:   'Detecting location...',
  detectSuccess:   'Location detected - edit if needed',
  detectPrivacy:   'Only used to fill your address - never stored or tracked.',
  deliverBtn:      'Deliver Here',
  sslNote:         '256-bit SSL. Your data is safe.',
  successTitle:    'Order Placed!',
  successSub:      'Estimated delivery in 2-5 business days.',
  viewOrders:      'View Orders',
  continueShopping:'Continue Shopping',
};

export const HERO = {
  eyebrow: 'Curated marketplace',
  headline_line1: 'Shop smarter',
  headline_line2: 'Live better',
  sub: 'Premium essentials, verified sellers, fast delivery, and secure checkout in one place.',
  cta_primary:   { label: 'Shop Products', path: ROUTES.PRODUCTS },
  cta_secondary: { label: 'View Orders',   path: ROUTES.ORDERS },
  stats: [
    { value: '12K+', label: 'Products' },
    { value: '4.8',  label: 'Avg Rating' },
    { value: '24h',  label: 'Dispatch' },
  ],
};

export const HOME_CATEGORIES = [
  { id: 'Electronics', label: 'Electronics', icon: 'monitor', accent: 'var(--info-bright)' },
  { id: 'Fashion',     label: 'Fashion',     icon: 'shirt',   accent: 'var(--primary)' },
  { id: 'Home',        label: 'Home',        icon: 'home',    accent: 'var(--success-bright)' },
  { id: 'Appliances',  label: 'Appliances',  icon: 'tool',    accent: 'var(--warning-bright)' },
  { id: 'Beauty',      label: 'Beauty',      icon: 'spark',   accent: 'var(--error-bright)' },
  { id: 'All',         label: 'All',         icon: 'grid',    accent: 'var(--text-secondary)' },
];

export const HOME_FEATURES = [
  { icon: 'truck',    title: 'Fast Delivery' },
  { icon: 'return',   title: 'Easy Returns' },
  { icon: 'shield',   title: 'Secure Checkout' },
  { icon: 'support',  title: 'Live Support' },
];

export const HOME_SECTIONS = {
  trending: { eyebrow: 'Trending now',   heading: 'Trending Products', sub: 'Popular products customers are checking now' },
  new:      { eyebrow: 'Fresh arrivals', heading: 'New Arrivals',      sub: 'Recently added picks across categories' },
  featured: { eyebrow: 'Top value',      heading: 'Top Deals',         sub: 'Highest discounts across all categories' },
};

export const TOAST_CONFIG = {
  success: { icon: 'check', color: 'var(--success-bright)', bg: 'var(--success-bg)', border: 'var(--success-bg)' },
  error:   { icon: 'x',     color: 'var(--error-bright)',   bg: 'var(--error-bg)',   border: 'var(--error-bg)' },
  warning: { icon: 'alert', color: 'var(--warning-bright)', bg: 'var(--warning-bg)', border: 'var(--warning-bg)' },
  info:    { icon: 'info',  color: 'var(--info-bright)',    bg: 'var(--info-bg)',    border: 'var(--info-bg)' },
};

export const CHART_COLORS = {
  primary:   'var(--primary)',
  secondary: 'var(--primary-subtle)',
  success:   'var(--success-bright)',
  info:      'var(--info-bright)',
  warning:   'var(--warning-bright)',
};

export const PRODUCT_LABELS = {
  quickView:      'Quick View',
  outOfStock:     'Out of Stock',
  addToCart:      '+ Add to Cart',
  addedToCart:    'Added to Cart',
  adding:         'Adding...',
  freeDelivery:   'Free Delivery',
  inclusiveTaxes: 'Inclusive of all taxes',
  buyNow:         'Buy Now',
  inStock:        'In Stock',
  noDescription:  'No description available.',
  noSpecs:        'No specifications available.',
  noReviews:      'No reviews yet.',
  related:        'Related Products',
};

export const ADDRESS_TYPES = ['HOME', 'WORK', 'OTHER'];

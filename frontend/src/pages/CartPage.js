import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMinus, FiPlus, FiShield, FiTrash2, FiTruck } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { calculateOrderTotals } from '../utils/orderTotals';
import { EMPTY_STATES } from '../constants/labels';
import { ROUTE, ROUTES } from '../constants/routes';

const summaryLabels = {
  price: 'Price',
  discount: 'Discount',
  gst: 'GST (18%)',
  platform: 'Platform Fee',
  delivery: 'Delivery Charges',
  total: 'Total Amount',
  checkout: 'Checkout',
  continue: 'Continue Shopping',
  wishlist: 'Move to Wishlist',
  adminTitle: 'Admin mode',
  adminSub: 'Cart and checkout are available only for customer accounts.',
  dashboard: 'Go to Dashboard',
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, user, toggleWishlist } = useApp();
  const navigate = useNavigate();
  const { totalMRP, discount, gst, platformFee, deliveryCharge, finalPrice, freeDeliveryMinimum, subtotal } = calculateOrderTotals(cart);
  const remaining = Math.max((freeDeliveryMinimum || 0) - (subtotal || 0), 0);

  if (user?.role === 'ADMIN') {
    return (
      <div className="empty-state" style={{ minHeight: '70vh', background: 'var(--bg-main)' }}>
        <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 460 }}>
          <h1>{summaryLabels.adminTitle}</h1>
          <p>{summaryLabels.adminSub}</p>
          <button onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="btn-primary" style={{ marginTop: 18 }}>{summaryLabels.dashboard}</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh', background: 'var(--bg-main)' }}>
        <div className="empty-state-icon">{EMPTY_STATES.cart.icon}</div>
        <div className="empty-state-title">{EMPTY_STATES.cart.title}</div>
        <div className="empty-state-sub">{EMPTY_STATES.cart.sub}</div>
        <Link to={ROUTES.PRODUCTS} className="btn-primary">{summaryLabels.continue}</Link>
      </div>
    );
  }

  const priceRows = [
    { key: 'price', label: `${summaryLabels.price} (${totalItems} items)`, value: `₹${totalMRP.toLocaleString('en-IN')}` },
    { key: 'discount', label: summaryLabels.discount, value: `- ₹${discount.toLocaleString('en-IN')}`, color: 'var(--success)' },
    { key: 'gst', label: summaryLabels.gst, value: `₹${gst.toLocaleString('en-IN')}` },
    { key: 'platform', label: summaryLabels.platform, value: `₹${platformFee.toLocaleString('en-IN')}` },
    { key: 'delivery', label: summaryLabels.delivery, value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`, color: deliveryCharge === 0 ? 'var(--success)' : 'var(--text-primary)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '20px 0' }}>
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <h1 className="section-heading-left" style={{ marginBottom: 16 }}>My Cart ({totalItems})</h1>

        <div className="checkout-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence mode="popLayout">
              {cart.map(item => {
                const id = item.productId || item.id;
                const name = item.productName || item.name || 'Product';
                return (
                  <motion.article
                    key={id}
                    layout
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    className="card"
                    style={{ padding: 16, boxShadow: 'var(--shadow-card)' }}
                  >
                    <div className="flex gap-4">
                      <Link to={ROUTE.product(id)} style={{ width: 88, height: 88, flexShrink: 0, background: 'var(--bg-raised)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={item.imageUrl || item.images?.[0] || IMG_FALLBACK} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8 }} onError={event => { event.target.onerror = null; event.target.src = IMG_FALLBACK; }} />
                      </Link>
                      <div className="min-w-0 flex-1">
                        {item.category && <p style={{ color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>{item.category}</p>}
                        <Link to={ROUTE.product(id)} style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 600, display: 'block' }} className="line-clamp-2">{name}</Link>
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span className="price-tag">₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
                          {item.mrp > item.price && <span className="price-strike">₹{Number(item.mrp).toLocaleString('en-IN')}</span>}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <motion.button whileTap={{ scale: 0.88 }} onClick={() => updateQuantity(id, item.quantity - 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={13} /></motion.button>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--text-primary)', minWidth: 32, textAlign: 'center' }}>{item.quantity}</span>
                            <motion.button whileTap={{ scale: 0.88 }} onClick={() => updateQuantity(id, item.quantity + 1)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-raised)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={13} /></motion.button>
                          </div>
                          <button onClick={() => removeFromCart(id)} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--error)', background: 'transparent', fontWeight: 700, fontSize: 13 }}><FiTrash2 size={14} /> Remove</button>
                          <button onClick={() => { toggleWishlist(id); removeFromCart(id); }} style={{ color: 'var(--primary)', background: 'transparent', fontSize: 12, fontWeight: 700 }}>{summaryLabels.wishlist}</button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>

          <aside>
            <div className="card" style={{ position: 'sticky', top: 120, padding: 20, boxShadow: 'var(--shadow-card)' }}>
              <h2 className="section-heading-left" style={{ marginBottom: 16 }}>Price Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {priceRows.map(row => (
                  <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ color: row.color || 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
                {deliveryCharge > 0 && remaining > 0 && <p style={{ color: 'var(--warning)', fontSize: 12 }}>Add ₹{remaining.toLocaleString('en-IN')} more for free delivery</p>}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{summaryLabels.total}</strong>
                  <span className="price-tag" style={{ fontSize: 20 }}>₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={() => (user ? navigate(ROUTES.CHECKOUT) : navigate(ROUTES.LOGIN))} className="btn-primary" style={{ width: '100%' }}>{summaryLabels.checkout}</button>
                <button onClick={() => navigate(ROUTES.PRODUCTS)} className="btn-ghost" style={{ width: '100%' }}>{summaryLabels.continue}</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}><FiShield /> Safe and secure payments</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}><FiTruck /> Fast delivery on available items</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

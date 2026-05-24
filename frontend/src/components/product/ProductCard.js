import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { PRODUCT_LABELS } from '../../constants/labels';
import { ROUTE } from '../../constants/routes';

export const ProductCardSkeleton = () => (
  <div className="card" style={{ overflow: 'hidden', borderRadius: 'var(--r-lg)' }}>
    <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 0 }} />
    <div style={{ padding: '12px 14px 14px' }}>
      <div className="skeleton" style={{ height: 10, width: '40%', marginTop: 12 }} />
      <div className="skeleton" style={{ height: 14, width: '85%', marginTop: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', marginTop: 6 }} />
      <div className="skeleton" style={{ height: 10, width: '55%', marginTop: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '45%', marginTop: 10 }} />
      <div className="skeleton" style={{ height: 34, marginTop: 10, borderRadius: 'var(--r-md)' }} />
    </div>
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart, cart, toggleWishlist, isWishlisted, user } = useApp();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const productId = product.productId || product.id;
  const productName = product.productName || product.name;
  const imageUrl = product.images?.[0] || product.imageUrl;
  const inCart = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted = isWishlisted(productId);
  const discountPct = product.mrp && product.price ? Math.max(0, Math.round((1 - product.price / product.mrp) * 100)) : 0;
  const rating = product.avgRating ?? product.rating;
  const reviews = product.reviewCount ?? product.reviewsCount ?? product.reviews;
  const isAdmin = user?.role === 'ADMIN';
  const isOutOfStock = product.stockQuantity === 0;

  const handleAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);
    await addToCart(product);
    window.setTimeout(() => setAdding(false), 1200);
  };

  const openProduct = () => navigate(ROUTE.product(productId));

  return (
    <motion.article
      onClick={openProduct}
      className="card hover-lift hover-coral hover-zoom-img"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-lg)' }}
    >
      <div style={{ position: 'relative', aspectRatio: '1/1', background: 'var(--bg-raised)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
          {product.badge && <span className="badge badge-hot">{product.badge}</span>}
          {discountPct > 0 && <span className="badge badge-sale">-{discountPct}%</span>}
          {product.isNew && <span className="badge badge-new">NEW</span>}
        </div>

        {!isAdmin && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.72 }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleWishlist(productId);
            }}
            aria-label="Wishlist"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              borderRadius: '50%',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: wishlisted ? 'var(--error-bg)' : 'var(--bg-glass-hover)',
              border: wishlisted ? '1px solid var(--error-bg)' : '1px solid var(--border-default)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <FiHeart size={16} fill={wishlisted ? 'var(--error-bright)' : 'none'} color={wishlisted ? 'var(--error-bright)' : 'var(--text-muted)'} />
          </motion.button>
        )}

        {imgError || !imageUrl ? (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            {productName?.[0]?.toUpperCase() || '?'}
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={productName}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ objectFit: 'contain', width: '100%', height: '100%', padding: 12 }}
          />
        )}

        <AnimatePresence>
          <motion.button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openProduct();
            }}
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="product-card-quick-view"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              padding: 10,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              backdropFilter: 'blur(4px)',
            }}
          >
            {PRODUCT_LABELS.quickView}
          </motion.button>
        </AnimatePresence>

        {isOutOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-glass-hover)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <span className="badge badge-muted">{PRODUCT_LABELS.outOfStock}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', minHeight: 184 }}>
        {product.category && (
          <div style={{ color: 'var(--text-coral)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            {product.category}
          </div>
        )}
        <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, lineHeight: 1.42, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '4px 0 8px', minHeight: 40 }}>
          {productName}
        </h3>

        {rating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <FiStar key={index} size={12} fill={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'none'} color={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'var(--text-ghost)'} />
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{Number(rating).toFixed(1)}</span>
            {reviews !== undefined && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({Number(reviews).toLocaleString('en-IN')})</span>}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <span className="price-tag" style={{ fontSize: 16 }}>Rs {Number(product.price || 0).toLocaleString('en-IN')}</span>
            {product.mrp > product.price && <span className="price-strike">Rs {Number(product.mrp).toLocaleString('en-IN')}</span>}
            {discountPct > 0 && <span className="price-save">{discountPct}% off</span>}
          </div>
          {(product.hasFreeDelivery === true || product.hasFreeDelivery === undefined) && (
            <div style={{ color: 'var(--success)', fontSize: 11, fontWeight: 600, marginTop: 4 }}>{PRODUCT_LABELS.freeDelivery}</div>
          )}
          {!isAdmin && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              disabled={adding || isOutOfStock}
              animate={{
                background: adding || inCart ? 'var(--success-bg)' : 'var(--primary-subtle)',
                color: adding || inCart ? 'var(--success)' : 'var(--primary)',
              }}
              style={{
                width: '100%',
                borderRadius: 'var(--r-md)',
                fontSize: 13,
                fontWeight: 600,
                padding: '9px 0',
                marginTop: 10,
                border: adding || inCart ? '1px solid var(--success-bg)' : '1px solid var(--border-coral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <FiShoppingCart size={14} />
              {isOutOfStock ? PRODUCT_LABELS.outOfStock : adding ? PRODUCT_LABELS.adding : inCart ? PRODUCT_LABELS.addedToCart : PRODUCT_LABELS.addToCart}
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronRight as FiCR, FiHeart, FiShoppingCart, FiStar, FiX } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { PRODUCT_LABELS } from '../constants/labels';
import { ROUTE, ROUTES } from '../constants/routes';
import { useAutoSlider } from '../hooks/useAutoSlider';
import ProductCard, { ProductCardSkeleton } from '../components/Product/ProductCard';

const tabConfig = [
  { key: 'description',    label: 'Description' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'reviews',        label: 'Reviews' },
];

const ProductDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart, cart, toggleWishlist, isWishlisted, user } = useApp();
<<<<<<< HEAD

  const [product,         setProduct]         = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading,  setRelatedLoading]  = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [quantity,        setQuantity]        = useState(1);
  const [activeTab,       setActiveTab]       = useState('description');
  const [added,           setAdded]           = useState(false);
  const [zoomOpen,        setZoomOpen]        = useState(false);

  // Load main product
=======
  const [product, setProduct]               = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading]   = useState(false);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [quantity, setQuantity]             = useState(1);
  const [activeTab, setActiveTab]           = useState('description');
  const [added, setAdded]                   = useState(false);
  const [zoomOpen, setZoomOpen]             = useState(false);

  // Load the main product record.
>>>>>>> 563c935 (make respansive ui)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
        setError('Unable to load product. Please try again.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

<<<<<<< HEAD
  // FIX: Related products now use category endpoint instead of fetching all products.
  // Old: api.get('/products?page=0&size=20') — slow, fetches everything
  // New: api.get('/products/category/{category}?size=5') — fast, only this category
=======
  // Load related products from the same category to keep the payload small.
>>>>>>> 563c935 (make respansive ui)
  useEffect(() => {
    if (!product?.category) return;
    const loadRelated = async () => {
      setRelatedLoading(true);
      try {
        const res = await api.get(
          `/products/category/${encodeURIComponent(product.category)}?page=0&size=5`
        );
<<<<<<< HEAD
        const list          = res.data?.content || [];
        const productIdValue = product.productId || product.id;
        setRelatedProducts(
          list.filter(item => (item.productId || item.id) !== productIdValue).slice(0, 4)
=======
        const list = res.data?.content || [];
        const productIdValue = product.productId || product.id;
        setRelatedProducts(
          list
            .filter(item => (item.productId || item.id) !== productIdValue)
            .slice(0, 4)
>>>>>>> 563c935 (make respansive ui)
        );
      } catch {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    loadRelated();
  }, [product]);

  const productId   = product?.productId || product?.id || Number(id);
<<<<<<< HEAD
  const productName = product?.productName || product?.name || '';

  // FIX: images array — multiple images supported properly
  const images = useMemo(() =>
=======
  const productName = product?.productName || product?.name;
  const images      = useMemo(() =>
>>>>>>> 563c935 (make respansive ui)
    product?.images?.length
      ? product.images
      : product?.imageUrl
        ? [product.imageUrl]
        : [IMG_FALLBACK],
    [product]
  );
<<<<<<< HEAD

  // Image slider state — used for both mobile swipe dots and desktop thumbnails
=======
>>>>>>> 563c935 (make respansive ui)
  const imageSlider  = useAutoSlider({ total: images.length, config: { autoPlay: false, loop: true } });
  const inCart       = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted   = isWishlisted(productId);
  const rating       = product?.avgRating ?? product?.rating;
  const reviews      = product?.reviews || [];
  const reviewCount  = product?.reviewCount ?? product?.reviewsCount ?? (Array.isArray(reviews) ? reviews.length : 0);
  const discount     = product?.mrp && product.mrp > product.price
<<<<<<< HEAD
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
=======
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;
>>>>>>> 563c935 (make respansive ui)
  const isAdmin      = user?.role === 'ADMIN';
  const isOutOfStock = product?.stockQuantity === 0;

  // Save to recently viewed
  useEffect(() => {
    if (!product || isAdmin) return;
    const recent = JSON.parse(localStorage.getItem('recentProducts') || '[]');
    const next   = [product, ...recent.filter(p => (p.id || p.productId) !== productId)].slice(0, 12);
    localStorage.setItem('recentProducts', JSON.stringify(next));
  }, [product, productId, isAdmin]);

  const handleAdd = async () => {
    if (!product || isOutOfStock) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const buyNow = async () => {
    await handleAdd();
    navigate(ROUTES.CHECKOUT);
  };

  const specifications = useMemo(() => {
    if (Array.isArray(product?.specifications))
<<<<<<< HEAD
      return product.specifications.filter(r => r.key && r.value).map(r => [r.key, r.value]);
    return Object.entries(product?.specifications || {});
  }, [product]);

  // Loading state
=======
      return product.specifications.filter(row => row.key && row.value).map(row => [row.key, row.value]);
    return Object.entries(product?.specifications || {});
  }, [product]);

  // Loading state with a short English message.
>>>>>>> 563c935 (make respansive ui)
  if (loading) {
    return (
      <div style={{ minHeight: '70vh', background: 'var(--bg-main)', padding: 24 }}>
        <div className="mx-auto max-w-7xl">
<<<<<<< HEAD
          <div className="skeleton" style={{ height: 420, borderRadius: 'var(--r-xl)' }} />
          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>
=======
          <div className="skeleton" style={{ height: 520, borderRadius: 'var(--r-xl)' }} />
          <p style={{
            textAlign: 'center',
            marginTop: 16,
            color: 'var(--text-muted)',
            fontSize: 13,
          }}>
>>>>>>> 563c935 (make respansive ui)
            Loading product details, please wait...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!product || error) {
    return (
      <div className="empty-state" style={{ minHeight: '70vh', background: 'var(--bg-main)' }}>
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-title">{error || 'Product not found'}</div>
        <button onClick={() => navigate(ROUTES.HOME)} className="btn-primary">Go home</button>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingBottom: 32 }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4" style={{ paddingTop: 18 }}>

        {/* Breadcrumb */}
        <div
          className="mb-3 flex items-center gap-1 overflow-hidden text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <Link to={ROUTES.HOME}>Home</Link>
          <FiCR size={12} />
          {product.category && (
            <>
              <Link to={ROUTE.category(product.category)}>{product.category}</Link>
              <FiCR size={12} />
            </>
          )}
          {/* FIX: truncate long product name in breadcrumb so it does not overflow */}
          <span className="truncate" style={{ maxWidth: '45vw' }}>{productName}</span>
        </div>

        {/* ─── Main product card ───────────────────────────────────────────────
            FIX: On mobile (< 640px) switch from 2-column grid to single column
            so image takes full width and info panel sits below it.
            Old: gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)' always 2 col
            New: responsive — 1 col on mobile, 2 col on sm+ screens            */}
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            overflow: 'hidden',
          }}
        >

          {/* ── LEFT: Image panel ── */}
          <div
            style={{
              padding: 14,
              borderRight: 'none',  // removed on mobile — border added back on sm via CSS class below
            }}
            className="product-image-panel"
          >

            {/* ─────────────────────────────────────────────────────────────────
                FIX: Multiple images on mobile
                Old: thumbnail strip used className="hidden sm:flex" — completely
                     hidden on mobile, so only 1 image was ever visible on phone.
                New: On mobile we show dot indicators + left/right arrow buttons
                     instead of thumbnail strip. On desktop (sm+) the thumbnail
                     strip shows on the left side as before.                    */}

            <div style={{ display: 'flex', gap: 10, position: 'relative' }}>

              {/* Desktop thumbnail strip — hidden on mobile, shown on sm+ */}
=======
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '18px 0 32px' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4">

        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1 overflow-hidden text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link to={ROUTES.HOME}>Home</Link>
          <FiChevronRight />
          {product.category && (
            <>
              <Link to={ROUTE.category(product.category)}>{product.category}</Link>
              <FiChevronRight />
            </>
          )}
          <span className="truncate">{productName}</span>
        </div>

        <div className="card product-detail-grid">

          {/* Product images */}
          <div className="product-image-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 12 }}>
>>>>>>> 563c935 (make respansive ui)
              {images.length > 1 && (
                <div
                  className="hidden sm:flex"
                  style={{ width: 64, flexDirection: 'column', gap: 8, flexShrink: 0 }}
                >
                  {images.map((img, index) => (
                    <button
                      key={img + index}
                      onClick={() => imageSlider.goTo(index)}
                      style={{
<<<<<<< HEAD
                        width: 60, height: 60,
=======
                        width: 64, height: 64,
>>>>>>> 563c935 (make respansive ui)
                        borderRadius: 'var(--r-sm)',
                        border: index === imageSlider.current
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-default)',
                        background: 'var(--bg-raised)',
                        padding: 4,
<<<<<<< HEAD
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
=======
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
>>>>>>> 563c935 (make respansive ui)
                    </button>
                  ))}
                </div>
              )}
<<<<<<< HEAD

              {/* Main image */}
              <div style={{ flex: 1, position: 'relative' }}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setZoomOpen(true)}
                  style={{
                    position: 'relative',
                    width: '100%',
                    // FIX: height responsive — smaller on mobile, taller on desktop
                    minHeight: 'clamp(220px, 50vw, 390px)',
                    background: 'var(--bg-raised)',
                    borderRadius: 'var(--r-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'zoom-in',
                    overflow: 'hidden',
                  }}
                >
                  {/* Discount badge */}
                  {discount > 0 && (
                    <span
                      className="badge badge-sale"
                      style={{ position: 'absolute', left: 10, top: 10, zIndex: 2 }}
                    >
                      {discount}% off
                    </span>
                  )}

                  {/* Wishlist button */}
                  {!isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(productId); }}
                      style={{
                        position: 'absolute', right: 10, top: 10, zIndex: 2,
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--bg-glass)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <FiHeart
                        size={16}
                        fill={wishlisted ? 'var(--error-bright)' : 'none'}
                        color={wishlisted ? 'var(--error-bright)' : 'var(--text-muted)'}
                      />
                    </button>
                  )}

                  {/* Product image */}
                  <img
                    src={images[imageSlider.current] || IMG_FALLBACK}
                    alt={productName}
                    onError={(e) => { e.target.src = IMG_FALLBACK; }}
                    style={{
                      maxWidth: '90%',
                      maxHeight: 'clamp(200px, 45vw, 360px)',
                      objectFit: 'contain',
                    }}
                  />
                </motion.div>

                {/* FIX: Mobile image navigation — left/right arrows + dot indicators
                    Shown only on mobile (sm:hidden), hidden on desktop where
                    the thumbnail strip handles image switching                 */}
                {images.length > 1 && (
                  <div
                    className="sm:hidden"
                    style={{ marginTop: 10 }}
                  >
                    {/* Arrow buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      <button
                        onClick={() => imageSlider.prev()}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <FiChevronLeft size={16} />
                      </button>

                      {/* Dot indicators — one dot per image */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => imageSlider.goTo(index)}
                            style={{
                              width: index === imageSlider.current ? 20 : 8,
                              height: 8,
                              borderRadius: 4,
                              background: index === imageSlider.current
                                ? 'var(--primary)'
                                : 'var(--border-default)',
                              transition: 'all 0.2s',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => imageSlider.next()}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <FiChevronRight size={16} />
                      </button>
                    </div>

                    {/* Image counter — e.g. "2 / 5" */}
                    <p style={{
                      textAlign: 'center', marginTop: 6,
                      fontSize: 11, color: 'var(--text-muted)',
                    }}>
                      {imageSlider.current + 1} / {images.length}
                    </p>
                  </div>
                )}
              </div>
=======
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => setZoomOpen(true)}
                style={{
                  position: 'relative', flex: 1, minHeight: 390,
                  background: 'var(--bg-raised)',
                  borderRadius: 'var(--r-lg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'zoom-in', overflow: 'hidden',
                }}
              >
                {discount > 0 && (
                  <span className="badge badge-sale" style={{ position: 'absolute', left: 14, top: 14 }}>
                    {discount}% off
                  </span>
                )}
                {!isAdmin && (
                  <button
                    onClick={(event) => { event.stopPropagation(); toggleWishlist(productId); }}
                    style={{
                      position: 'absolute', right: 14, top: 14,
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--bg-glass)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FiHeart
                      fill={wishlisted ? 'var(--error-bright)' : 'none'}
                      color={wishlisted ? 'var(--error-bright)' : 'var(--text-muted)'}
                    />
                  </button>
                )}
                <ProductImageZoom src={images[imageSlider.current]} alt={productName} />
              </motion.div>
>>>>>>> 563c935 (make respansive ui)
            </div>

            {/* Add to Cart + Buy Now buttons — below image on mobile */}
            {!isAdmin && (
<<<<<<< HEAD
              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  // FIX: 2 column buttons — stretch full width on mobile
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="btn-ghost"
                  style={{ width: '100%', padding: '12px 8px', fontSize: 13 }}
                >
                  <FiShoppingCart size={14} />
                  {/* FIX: shorter label on mobile so it fits in the button */}
                  <span className="hidden sm:inline">
                    {added || inCart ? PRODUCT_LABELS.addedToCart : PRODUCT_LABELS.addToCart}
                  </span>
                  <span className="sm:hidden">
                    {added || inCart ? 'Added' : 'Add to Cart'}
                  </span>
                </button>
                <button
                  onClick={buyNow}
                  disabled={isOutOfStock}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 8px', fontSize: 13 }}
                >
=======
              <div className="two-col" style={{ marginTop: 16 }}>
                <button onClick={handleAdd} disabled={isOutOfStock} className="btn-ghost" style={{ width: '100%' }}>
                  <FiShoppingCart /> {added || inCart ? PRODUCT_LABELS.addedToCart : PRODUCT_LABELS.addToCart}
                </button>
                <button onClick={buyNow} disabled={isOutOfStock} className="btn-primary" style={{ width: '100%' }}>
>>>>>>> 563c935 (make respansive ui)
                  Buy Now
                </button>
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* ── RIGHT: Product info panel ── */}
          <div
            style={{
              padding: '16px 14px',
              // FIX: top border on mobile (since grid is now 1 column the
              // border-right of left panel does not appear — use border-top instead)
              borderTop: '1px solid var(--border-subtle)',
            }}
            className="product-info-panel"
          >

            {/* Brand */}
            {product.brand && (
              <p style={{
                color: 'var(--primary)',
                // FIX: brand name was overflowing — added overflow hidden + truncate
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
=======
          {/* Product information */}
          <div className="product-info-panel" style={{ padding: 24 }}>
            {product.brand && (
              <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
>>>>>>> 563c935 (make respansive ui)
                {product.brand}
              </p>
            )}

<<<<<<< HEAD
            {/* Product name
                FIX: was using browser default heading font size — too large on mobile
                Now uses clamp: 16px on small mobile, scales up to 26px on desktop
                Also added word-break so very long words don't overflow the container */}
=======
>>>>>>> 563c935 (make respansive ui)
            <h1 style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
<<<<<<< HEAD
              fontSize: 'clamp(16px, 4vw, 26px)',
              lineHeight: 1.25,
              marginTop: 6,
              wordBreak: 'break-word',
=======
              fontSize: 'clamp(15px, 3.5vw, 26px)',
              lineHeight: 1.25,
              marginTop: 6,
>>>>>>> 563c935 (make respansive ui)
            }}>
              {productName}
            </h1>

            {/* Rating */}
<<<<<<< HEAD
            <div style={{
              display: 'flex', alignItems: 'center',
              flexWrap: 'wrap', gap: 8, marginTop: 10,
            }}>
              {rating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i} size={13}
                      fill={i < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'none'}
                      color={i < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'var(--text-ghost)'}
=======
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {rating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FiStar
                      key={index}
                      size={14}
                      fill={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'none'}
                      color={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'var(--text-ghost)'}
>>>>>>> 563c935 (make respansive ui)
                    />
                  ))}
                </span>
              )}
<<<<<<< HEAD
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>
                {Number(rating || 0).toFixed(1)} ({Number(reviewCount).toLocaleString('en-IN')})
              </span>
            </div>

            {/* Price section
                FIX: Price was showing "Rs" on one line and "10,000" on another line
                because the span had fontSize:30 and the container was too narrow.
                Fix: wrap price in flex row, reduce font on mobile with clamp,
                ensure "Rs" and amount stay on same line                         */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <span
                  className="price-tag"
                  style={{
                    // FIX: was hardcoded fontSize:30 — too large on mobile narrow panel
                    fontSize: 'clamp(20px, 5vw, 30px)',
                    // FIX: ensure Rs and number stay together — no-wrap
                    whiteSpace: 'nowrap',
                  }}
                >
                  Rs {Number(product.price || 0).toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span
                    className="price-strike"
                    style={{ fontSize: 'clamp(13px, 3vw, 18px)', whiteSpace: 'nowrap' }}
                  >
                    Rs {Number(product.mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge badge-sale">{discount}% off</span>
                )}
              </div>
              <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-muted)' }}>
                {PRODUCT_LABELS.inclusiveTaxes}
              </p>
            </div>

            {/* Stock badge */}
            <div style={{ marginTop: 14 }}>
              {isOutOfStock
                ? <span className="badge badge-error">{PRODUCT_LABELS.outOfStock}</span>
                : product.stockQuantity <= 5
                  ? <span className="badge badge-warning">Only {product.stockQuantity} left</span>
                  : <span className="badge badge-success">In Stock</span>
              }
            </div>

            {/* Quantity selector */}
            <div style={{
              marginTop: 18,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="btn-subtle"
                style={{ width: 38, height: 38, flexShrink: 0 }}
              >
                -
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))}
                className="btn-subtle"
                style={{ width: 38, height: 38, flexShrink: 0 }}
              >
                +
              </button>
            </div>

            {/* Description / Specs / Reviews tabs
                FIX: tab labels were overflowing on narrow mobile screens
                Added fontSize:12 and min font scaling for tab buttons         */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                gap: 4,
                overflowX: 'auto',  // FIX: allow horizontal scroll if tabs don't fit
              }}>
=======
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {Number(rating || 0).toFixed(1)} ({Number(reviewCount).toLocaleString('en-IN')})
              </span>
            </div>

            {/* Price */}
            <div style={{ marginTop: 22 }}>
              <span className="price-tag" style={{ fontSize: 30 }}>
                Rs {Number(product.price || 0).toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="price-strike" style={{ fontSize: 18, marginLeft: 12 }}>
                  Rs {Number(product.mrp).toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="badge badge-sale" style={{ marginLeft: 12 }}>{discount}% off</span>
              )}
              <p style={{ fontSize: 12, marginTop: 4 }}>{PRODUCT_LABELS.inclusiveTaxes}</p>
            </div>

            {/* Stock */}
            <div style={{ marginTop: 18 }}>
              {isOutOfStock
                ? <span className="badge badge-error">{PRODUCT_LABELS.outOfStock}</span>
                : product.stockQuantity <= 5
                  ? <span className="badge badge-warning" style={{ animation: 'pulse-coral 1s ease 3' }}>Only {product.stockQuantity} left</span>
                  : <span className="badge badge-success">In Stock</span>
              }
            </div>

            {/* Quantity */}
            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn-subtle">-</button>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))} className="btn-subtle">+</button>
            </div>

            {/* Tabs */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: 18 }}>
>>>>>>> 563c935 (make respansive ui)
                {tabConfig.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      background: 'transparent',
<<<<<<< HEAD
                      padding: '10px 8px',
                      // FIX: clamp font size so tabs fit on narrow screens
                      fontSize: 'clamp(11px, 2.5vw, 14px)',
                      whiteSpace: 'nowrap',
                      color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === tab.key
                        ? '2px solid var(--primary)'
                        : '2px solid transparent',
                      fontWeight: activeTab === tab.key ? 700 : 500,
                      flexShrink: 0,
=======
                      padding: '12px 0',
                      fontSize: 14,
                      color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                      fontWeight: activeTab === tab.key ? 700 : 500,
>>>>>>> 563c935 (make respansive ui)
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

<<<<<<< HEAD
              <div style={{ padding: '14px 0' }}>
                {activeTab === 'description' && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                    {product.description || PRODUCT_LABELS.noDescription}
                  </p>
=======
              <div style={{ padding: '18px 0' }}>
                {activeTab === 'description' && (
                  <div>
                    <h2 style={{
                      color: 'var(--text-primary)',
                      borderLeft: '3px solid var(--primary)',
                      paddingLeft: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      fontFamily: 'var(--font-display)',
                      marginBottom: 10,
                    }}>
                      {tabConfig[0].label}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                      {product.description || PRODUCT_LABELS.noDescription}
                    </p>
                  </div>
>>>>>>> 563c935 (make respansive ui)
                )}

                {activeTab === 'specifications' && (
<<<<<<< HEAD
                  specifications.length
                    ? specifications.map(([key, value], i) => (
=======
                  specifications.length ? (
                    <div>
                      {specifications.map(([key, value], index) => (
>>>>>>> 563c935 (make respansive ui)
                        <div
                          key={key}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr',
<<<<<<< HEAD
                            padding: '8px 10px',
                            background: i % 2 === 0 ? 'var(--bg-raised)' : 'transparent',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{key}</span>
                          <span style={{ color: 'var(--text-primary)', fontSize: 12, wordBreak: 'break-word' }}>{value}</span>
                        </div>
                      ))
                    : <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{PRODUCT_LABELS.noSpecs}</p>
=======
                            padding: '10px 12px',
                            background: index % 2 === 0 ? 'var(--bg-raised)' : 'transparent',
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{key}</span>
                          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: 'var(--text-secondary)' }}>{PRODUCT_LABELS.noSpecs}</p>
>>>>>>> 563c935 (make respansive ui)
                )}

                {activeTab === 'reviews' && (
                  Array.isArray(reviews) && reviews.length
<<<<<<< HEAD
                    ? reviews.map((review, i) => (
                        <div key={review.reviewId || i} className="card" style={{ padding: 12, marginBottom: 8 }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>
=======
                    ? reviews.map((review, index) => (
                        <div key={review.reviewId || index} className="card" style={{ padding: 14, marginBottom: 10 }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>
>>>>>>> 563c935 (make respansive ui)
                            {review.reviewerName || review.userName || 'Customer'}
                          </strong>
                          <div style={{ marginTop: 4 }}>
                            {Array.from({ length: 5 }).map((_, star) => (
                              <FiStar
<<<<<<< HEAD
                                key={star} size={12}
=======
                                key={star}
                                size={13}
>>>>>>> 563c935 (make respansive ui)
                                fill={star < Math.round(Number(review.rating || 0)) ? 'var(--warning-bright)' : 'none'}
                                color={star < Math.round(Number(review.rating || 0)) ? 'var(--warning-bright)' : 'var(--text-ghost)'}
                              />
                            ))}
                          </div>
<<<<<<< HEAD
                          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
=======
                          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
>>>>>>> 563c935 (make respansive ui)
                            {review.reviewText || review.comment}
                          </p>
                        </div>
                      ))
<<<<<<< HEAD
                    : <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{PRODUCT_LABELS.noReviews}</p>
=======
                    : <p style={{ color: 'var(--text-secondary)' }}>{PRODUCT_LABELS.noReviews}</p>
>>>>>>> 563c935 (make respansive ui)
                )}
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Related products */}
=======
        {/* Related Products */}
>>>>>>> 563c935 (make respansive ui)
        {(relatedLoading || relatedProducts.length > 0) && (
          <section style={{ marginTop: 28 }}>
            <h2 className="section-heading-left" style={{ marginBottom: 16 }}>Related Products</h2>
            <div className="product-grid">
              {relatedLoading
<<<<<<< HEAD
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
=======
                ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
>>>>>>> 563c935 (make respansive ui)
                : relatedProducts.map(item => <ProductCard key={item.productId || item.id} product={item} />)
              }
            </div>
          </section>
        )}
      </div>

<<<<<<< HEAD
      {/* Image zoom overlay — full screen on tap */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setZoomOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 1001,
              }}
            >
              <FiX size={18} />
            </button>

            {/* Zoomed image with mobile navigation */}
            <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
              <img
                src={images[imageSlider.current] || IMG_FALLBACK}
                alt={productName}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '82vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--r-lg)',
                }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Arrow nav in zoom view */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); imageSlider.prev(); }}
                    style={{
                      position: 'absolute', left: -16, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <FiChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); imageSlider.next(); }}
                    style={{
                      position: 'absolute', right: -16, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <FiChevronRight size={16} />
                  </button>
                  <p style={{
                    textAlign: 'center', marginTop: 12,
                    color: 'rgba(255,255,255,0.6)', fontSize: 12,
                  }}>
                    {imageSlider.current + 1} / {images.length}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
=======
      {/* Image zoom overlay */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'var(--bg-glass-hover)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <img
            src={images[imageSlider.current]}
            alt={productName}
            style={{
              maxWidth: '92vw', maxHeight: '88vh',
              objectFit: 'contain',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--r-lg)',
            }}
          />
        </div>
      )}
>>>>>>> 563c935 (make respansive ui)
    </div>
  );
};

export default ProductDetailPage;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { PRODUCT_LABELS } from '../constants/labels';
import { ROUTE, ROUTES } from '../constants/routes';
import { useAutoSlider } from '../hooks/useAutoSlider';
import ProductCard, { ProductCardSkeleton } from '../components/Product/ProductCard';
import ProductImageZoom from '../components/Product/ProductImageZoom';

const tabConfig = [
  { key: 'description', label: 'Description' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'reviews', label: 'Reviews' },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, toggleWishlist, isWishlisted, user } = useApp();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
        setError('Unable to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    const loadRelated = async () => {
      setRelatedLoading(true);
      try {
        const res = await api.get('/products?page=0&size=20');
        const list = res.data?.content || [];
        const productIdValue = product.productId || product.id;
        setRelatedProducts(list.filter(item => item.category === product.category && (item.productId || item.id) !== productIdValue).slice(0, 4));
      } catch {
        setRelatedProducts([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    loadRelated();
  }, [product]);

  const productId = product?.productId || product?.id || Number(id);
  const productName = product?.productName || product?.name;
  const images = useMemo(() => product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [IMG_FALLBACK], [product]);
  const imageSlider = useAutoSlider({ total: images.length, config: { autoPlay: false, loop: true } });
  const inCart = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted = isWishlisted(productId);
  const rating = product?.avgRating ?? product?.rating;
  const reviews = product?.reviews || [];
  const reviewCount = product?.reviewCount ?? product?.reviewsCount ?? (Array.isArray(reviews) ? reviews.length : 0);
  const discount = product?.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const isAdmin = user?.role === 'ADMIN';
  const isOutOfStock = product?.stockQuantity === 0;

  useEffect(() => {
    if (!product || isAdmin) return;
    const recent = JSON.parse(localStorage.getItem('recentProducts') || '[]');
    const next = [product, ...recent.filter(p => (p.id || p.productId) !== productId)].slice(0, 12);
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
    if (Array.isArray(product?.specifications)) return product.specifications.filter(row => row.key && row.value).map(row => [row.key, row.value]);
    return Object.entries(product?.specifications || {});
  }, [product]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', background: 'var(--bg-main)', padding: 24 }}>
        <div className="mx-auto max-w-7xl">
          <div className="skeleton" style={{ height: 520, borderRadius: 'var(--r-xl)' }} />
        </div>
      </div>
    );
  }

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '18px 0 32px' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-3 flex items-center gap-1 overflow-hidden text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link to={ROUTES.HOME}>Home</Link><FiChevronRight />
          {product.category && <><Link to={ROUTE.category(product.category)}>{product.category}</Link><FiChevronRight /></>}
          <span className="truncate">{productName}</span>
        </div>

        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', overflow: 'hidden' }}>
          <div style={{ padding: 18, borderRight: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {images.length > 1 && (
                <div className="hidden sm:flex" style={{ width: 68, flexDirection: 'column', gap: 8 }}>
                  {images.map((img, index) => (
                    <button key={img + index} onClick={() => imageSlider.goTo(index)} style={{ width: 64, height: 64, borderRadius: 'var(--r-sm)', border: index === imageSlider.current ? '2px solid var(--primary)' : '1px solid var(--border-default)', background: 'var(--bg-raised)', padding: 4 }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              )}
              <motion.div whileHover={{ scale: 1.04 }} onClick={() => setZoomOpen(true)} style={{ position: 'relative', flex: 1, minHeight: 390, background: 'var(--bg-raised)', borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in', overflow: 'hidden' }}>
                {discount > 0 && <span className="badge badge-sale" style={{ position: 'absolute', left: 14, top: 14 }}>{discount}% off</span>}
                {!isAdmin && <button onClick={(event) => { event.stopPropagation(); toggleWishlist(productId); }} style={{ position: 'absolute', right: 14, top: 14, width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiHeart fill={wishlisted ? 'var(--error-bright)' : 'none'} color={wishlisted ? 'var(--error-bright)' : 'var(--text-muted)'} /></button>}
                <ProductImageZoom src={images[imageSlider.current]} alt={productName} />
              </motion.div>
            </div>

            {!isAdmin && (
              <div className="two-col" style={{ marginTop: 16 }}>
                <button onClick={handleAdd} disabled={isOutOfStock} className="btn-ghost" style={{ width: '100%' }}><FiShoppingCart /> {added || inCart ? PRODUCT_LABELS.addedToCart : PRODUCT_LABELS.addToCart}</button>
                <button onClick={buyNow} disabled={isOutOfStock} className="btn-primary" style={{ width: '100%' }}>Buy Now</button>
              </div>
            )}
          </div>

          <div style={{ padding: 24 }}>
            {product.brand && <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{product.brand}</p>}
            <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: 6 }}>{productName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {rating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, index) => <FiStar key={index} size={14} fill={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'none'} color={index < Math.round(Number(rating)) ? 'var(--warning-bright)' : 'var(--text-ghost)'} />)}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{Number(rating || 0).toFixed(1)} ({Number(reviewCount).toLocaleString('en-IN')})</span>
            </div>

            <div style={{ marginTop: 22 }}>
              <span className="price-tag" style={{ fontSize: 30 }}>Rs {Number(product.price || 0).toLocaleString('en-IN')}</span>
              {product.mrp > product.price && <span className="price-strike" style={{ fontSize: 18, marginLeft: 12 }}>Rs {Number(product.mrp).toLocaleString('en-IN')}</span>}
              {discount > 0 && <span className="badge badge-sale" style={{ marginLeft: 12 }}>{discount}% off</span>}
              <p style={{ fontSize: 12, marginTop: 4 }}>{PRODUCT_LABELS.inclusiveTaxes}</p>
            </div>

            <div style={{ marginTop: 18 }}>
              {isOutOfStock ? <span className="badge badge-error">{PRODUCT_LABELS.outOfStock}</span> : product.stockQuantity <= 5 ? <span className="badge badge-warning" style={{ animation: 'pulse-coral 1s ease 3' }}>Only {product.stockQuantity} left</span> : <span className="badge badge-success">In Stock</span>}
            </div>

            <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn-subtle">-</button>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))} className="btn-subtle">+</button>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: 18 }}>
                {tabConfig.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ background: 'transparent', padding: '12px 0', color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent', fontWeight: activeTab === tab.key ? 600 : 500 }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '18px 0' }}>
                {activeTab === 'description' && (
                  <div>
                    <h2 style={{ color: 'var(--text-primary)', borderLeft: '3px solid var(--primary)', paddingLeft: 10, fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', marginBottom: 10 }}>{tabConfig[0].label}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{product.description || PRODUCT_LABELS.noDescription}</p>
                  </div>
                )}
                {activeTab === 'specifications' && (
                  specifications.length ? (
                    <div>
                      {specifications.map(([key, value], index) => (
                        <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', padding: '10px 12px', background: index % 2 === 0 ? 'var(--bg-raised)' : 'transparent' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{key}</span>
                          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p>{PRODUCT_LABELS.noSpecs}</p>
                )}
                {activeTab === 'reviews' && (
                  Array.isArray(reviews) && reviews.length ? reviews.map((review, index) => (
                    <div key={review.reviewId || index} className="card" style={{ padding: 14, marginBottom: 10 }}>
                      <strong>{review.reviewerName || review.userName || 'Customer'}</strong>
                      <div>{Array.from({ length: 5 }).map((_, star) => <FiStar key={star} size={13} fill={star < Math.round(Number(review.rating || 0)) ? 'var(--warning-bright)' : 'none'} color={star < Math.round(Number(review.rating || 0)) ? 'var(--warning-bright)' : 'var(--text-ghost)'} />)}</div>
                      <p>{review.reviewText || review.comment}</p>
                    </div>
                  )) : <p>{PRODUCT_LABELS.noReviews}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {(relatedLoading || relatedProducts.length > 0) && (
          <section style={{ marginTop: 28 }}>
            <h2 className="section-heading-left" style={{ marginBottom: 16 }}>Related Products</h2>
            <div className="product-grid">
              {relatedLoading ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />) : relatedProducts.map(item => <ProductCard key={item.productId || item.id} product={item} />)}
            </div>
          </section>
        )}
      </div>

      {zoomOpen && (
        <div onClick={() => setZoomOpen(false)} style={{ position: 'fixed', inset: 0, background: 'var(--bg-glass-hover)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <img src={images[imageSlider.current]} alt={productName} style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)' }} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

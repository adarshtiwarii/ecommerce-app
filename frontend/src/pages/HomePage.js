import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
} from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from '../components/Product/ProductCard';
import api from '../utils/api';
import { reverseGeocode } from '../utils/location';
import { EMPTY_STATES } from '../constants/labels';
import { ROUTE } from '../constants/routes';
import { SLIDER_CONFIG } from '../constants/sliderConfig';
import { useAutoSlider } from '../hooks/useAutoSlider';
import { useApp } from '../context/AppContext';

const sectionCopy = {
  heroLabel:        'Featured pick',
  heroCta:          'Shop now',
  locationTitle:    'Delivery location',
  locationFallback: 'Detect your area for faster delivery estimates.',
  detectLocation:   'Detect location',
  trending:         'Trending Products',
  deals:            'Top Deals',
  recent:           'Recently Viewed',
  newsletterTitle:  'Get the best deals first',
  newsletterText:   'Fresh offers, product drops, and order updates in one tidy place.',
  subscribe:        'Subscribe',
};

const getProductId    = product => product.productId || product.id;
const getProductName  = product => product.productName || product.name || 'Featured product';
const getProductImage = product => product.images?.[0] || product.imageUrl || '';
const isAdminRole     = role => String(role || '').toUpperCase() === 'ADMIN';

const HomeSection = ({ title, products, loading }) => {
  if (loading) {
    return (
      <section className="site-section">
        <h2 className="section-heading-left">{title}</h2>
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      </section>
    );
  }
  if (!products?.length) return null;
  return (
    <section className="site-section">
      <div className="section-row">
        <h2 className="section-heading-left">{title}</h2>
        <Link to={ROUTE.search()} className="btn-subtle">View all</Link>
      </div>
      <div className="product-grid">
        {products.slice(0, 8).map((product, index) => (
          <motion.div
            key={getProductId(product)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const HomePage = () => {
  const { user } = useApp();
  const [products,          setProducts]          = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [activeCategory,    setActiveCategory]    = useState(null);
  const [recentProducts,    setRecentProducts]    = useState([]);
  const [locationLabel,     setLocationLabel]     = useState(localStorage.getItem('deliveryLocation') || '');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [email,             setEmail]             = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/products?page=0&size=80');
        setProducts(res.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Unable to load products. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
    setRecentProducts(JSON.parse(localStorage.getItem('recentProducts') || '[]'));
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map(p => p.category).filter(Boolean))];
    return [{ id: null, name: 'All' }, ...unique.map(name => ({ id: name, name }))];
  }, [products]);

  const filteredProducts = useMemo(() => (
    activeCategory
      ? products.filter(product => product.category === activeCategory)
      : products
  ), [activeCategory, products]);

  const topDeals = useMemo(() => (
    [...products].sort((a, b) => {
      const dealA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
      const dealB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
      return dealB - dealA;
    })
  ), [products]);

  const banners = useMemo(() => (
    products.slice(0, 5).map(product => ({
      id:      getProductId(product),
      label:   product.category || sectionCopy.heroLabel,
      heading: getProductName(product),
      subtext: product.description || 'Fresh arrivals selected from current marketplace products.',
      ctaText: sectionCopy.heroCta,
      ctaUrl:  ROUTE.product(getProductId(product)),
      image:   getProductImage(product),
      price:   product.price,
      mrp:     product.mrp,
      brand:   product.brand,
    }))
  ), [products]);

  const heroSlider = useAutoSlider({ total: banners.length, config: SLIDER_CONFIG.hero });
  const dealPages  = Math.max(1, Math.ceil(topDeals.length / 4));
  const dealSlider = useAutoSlider({ total: dealPages, config: SLIDER_CONFIG.productCarousel });
  const isAdmin = isAdminRole(user?.role);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Location is not supported in this browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const geo   = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          const label = geo.displayName || [geo.city, geo.state, geo.pincode].filter(Boolean).join(', ');
          setLocationLabel(label);
          localStorage.setItem('deliveryLocation', label);
        } catch {
          setLocationLabel('Location detected, but address lookup failed.');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setLocationLabel('Location permission denied.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const subscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-4">

        {/* Error banner */}
        {error && (
          <div className="notice notice-error">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="btn-subtle">
              <FiRefreshCw /> Retry
            </button>
          </div>
        )}

        {/* ── Hero banner slider ─────────────────────────────────────────── */}
        {loading ? (
          <div className="skeleton hero-skeleton" />
        ) : banners.length > 0 ? (
          <section
            className="hero-banner slider-wrap"
            onMouseEnter={heroSlider.pause}
            onMouseLeave={heroSlider.resume}
          >
            <div
              className="slider-track"
              style={{ transform: `translateX(-${heroSlider.current * 100}%)` }}
            >
              {banners.map(banner => (
                /*
                 * FIX — only change in this file:
                 * Added `!items-start` on the article so the two columns
                 * don't stretch to fill the full banner height on mobile
                 * (single-column layout). On desktop the CSS class
                 * `hero-slide` still controls alignment normally.
                 * Zero color / style changes elsewhere.
                 */
                <article key={banner.id} className="hero-slide !items-start">

                  {/* Text content */}
                  <div className="hero-copy">
                    <p className="hero-eyebrow">{banner.brand || banner.label}</p>
                    <h1>{banner.heading}</h1>
                    <p className="hero-text">{banner.subtext}</p>
                    <div className="hero-actions">
                      {!isAdmin && (
                        <Link to={banner.ctaUrl} className="btn-primary">
                          {banner.ctaText}
                        </Link>
                      )}
                      {banner.price && (
                        <span className="hero-price">
                          Rs {Number(banner.price).toLocaleString('en-IN')}
                          {banner.mrp > banner.price && (
                            <small>Rs {Number(banner.mrp).toLocaleString('en-IN')}</small>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/*
                   * FIX — `self-center` added so the image container
                   * centres itself in the column instead of stretching
                   * to match the text column height on mobile.
                   * On desktop this has no visible effect because both
                   * columns are already the same height.
                   */}
                  <Link
                    to={banner.ctaUrl}
                    className="hero-media self-center"
                    aria-label={`View ${banner.heading}`}
                  >
                    {banner.image
                      ? <img src={banner.image} alt={banner.heading} />
                      : <span>{banner.heading[0]}</span>
                    }
                  </Link>

                </article>
              ))}
            </div>

            <button
              className="slider-arrow prev"
              onClick={heroSlider.prev}
              aria-label="Previous banner"
            >
              <FiChevronLeft />
            </button>
            <button
              className="slider-arrow next"
              onClick={heroSlider.next}
              aria-label="Next banner"
            >
              <FiChevronRight />
            </button>

            <div className="slider-counter">
              {String(heroSlider.current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
            </div>

            <div className="slider-dots">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === heroSlider.current ? 'active' : ''}`}
                  onClick={() => heroSlider.goTo(index)}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">{EMPTY_STATES.products.icon}</div>
            <div className="empty-state-title">{EMPTY_STATES.products.title}</div>
            <div className="empty-state-sub">{EMPTY_STATES.products.sub}</div>
          </div>
        )}

        {/* Category filter pills */}
        <div className="category-row">
          {categories.map(category => (
            <button
              key={category.name}
              className={`category-pill ${category.id === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Delivery location strip */}
        <section className="location-strip">
          <div>
            <h2 className="section-heading-left">{sectionCopy.locationTitle}</h2>
            <p><FiMapPin /> {locationLabel || sectionCopy.locationFallback}</p>
          </div>
          <button onClick={detectLocation} className="btn-ghost">
            {detectingLocation
              ? <FiRefreshCw className="animate-spin" />
              : <FiNavigation />
            }
            {sectionCopy.detectLocation}
          </button>
        </section>

        {/* Trending products */}
        <HomeSection
          title={sectionCopy.trending}
          products={filteredProducts}
          loading={loading}
        />

        {/* Top deals slider */}
        {!loading && topDeals.length > 0 && (
          <section
            className="site-section slider-wrap"
            onMouseEnter={dealSlider.pause}
            onMouseLeave={dealSlider.resume}
          >
            <div className="section-row">
              <h2 className="section-heading-left">{sectionCopy.deals}</h2>
              <div className="inline-dots">
                {Array.from({ length: dealPages }).map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${index === dealSlider.current ? 'active' : ''}`}
                    onClick={() => dealSlider.goTo(index)}
                    aria-label={`Go to deals page ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div
              className="slider-track"
              style={{ transform: `translateX(-${dealSlider.current * 100}%)` }}
            >
              {Array.from({ length: dealPages }).map((_, page) => (
                <div key={page} className="product-grid slider-page">
                  {topDeals.slice(page * 4, page * 4 + 4).map(product => (
                    <ProductCard key={getProductId(product)} product={product} />
                  ))}
                </div>
              ))}
            </div>
            <button
              className="slider-arrow prev"
              onClick={dealSlider.prev}
              aria-label="Previous deals"
            >
              <FiChevronLeft />
            </button>
            <button
              className="slider-arrow next"
              onClick={dealSlider.next}
              aria-label="Next deals"
            >
              <FiChevronRight />
            </button>
          </section>
        )}

        {/* Recently viewed */}
        <HomeSection
          title={sectionCopy.recent}
          products={recentProducts}
          loading={false}
        />

        {/* Newsletter */}
        <section className="newsletter-strip">
          <h2>{sectionCopy.newsletterTitle}</h2>
          <p>{sectionCopy.newsletterText}</p>
          <form className="newsletter-input-wrap" onSubmit={subscribe}>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="Email address"
              required
            />
            <button className="btn-primary" type="submit">{sectionCopy.subscribe}</button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiChevronLeft, FiChevronRight,
  FiNavigation, FiRefreshCw, FiShield, FiTruck,
} from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from '../components/Product/ProductCard';
import api from '../utils/api';
import { reverseGeocode } from '../utils/location';
import { EMPTY_STATES, TRUST_BADGES } from '../constants/labels';
import { ROUTE } from '../constants/routes';
import { SLIDER_CONFIG } from '../constants/sliderConfig';
import { useAutoSlider } from '../hooks/useAutoSlider';

const sectionCopy = {
  heroLabel:       'Fresh picks',
  heroCta:         'Shop now',
  locationTitle:   'Delivery location',
  locationFallback:'Detect your area for delivery estimates.',
  detectLocation:  'Detect location',
  trending:        'Trending Products',
  deals:           'Top Deals',
  recent:          'Recently Viewed',
  newsletterTitle: 'Get the best deals first',
  newsletterText:  'Fresh offers, product drops, and order updates in one tidy place.',
  subscribe:       'Subscribe',
};

// Reusable product section used for Trending and Recently Viewed
const HomeSection = ({ title, products, loading }) => {
  if (loading) {
    return (
      <section className="card" style={{ padding: 20 }}>
        <h2 className="section-heading-left">{title}</h2>
        <div className="product-grid" style={{ marginTop: 18 }}>
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }
  if (!products?.length) return null;
  return (
    <section className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 18 }}>
        <h2 className="section-heading-left">{title}</h2>
        <Link to={ROUTE.search()} className="btn-subtle">View all</Link>
      </div>
      <div className="product-grid">
        {products.slice(0, 8).map((product, index) => (
          <motion.div
            key={product.productId || product.id}
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
        // FIX: was Hinglish 'Products load nahi ho pa rahe. Backend check karo.'
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

  const filteredProducts = useMemo(() =>
    activeCategory
      ? products.filter(p => p.category === activeCategory)
      : products,
    [activeCategory, products]
  );

  const topDeals = useMemo(() =>
    [...products].sort((a, b) => {
      const da = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
      const db = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
      return db - da;
    }),
    [products]
  );

  const banners = useMemo(() => {
    const source = products.slice(0, 4);
    return source.length
      ? source.map(product => ({
          id:      product.productId || product.id,
          label:   product.category  || sectionCopy.heroLabel,
          heading: product.productName || product.name || '',
          subtext: product.description || TRUST_BADGES[0]?.text || '',
          ctaText: sectionCopy.heroCta,
          ctaUrl:  ROUTE.product(product.productId || product.id),
          image:   product.images?.[0] || product.imageUrl || '',
        }))
      : [];
  }, [products]);

  const heroSlider = useAutoSlider({ total: banners.length, config: SLIDER_CONFIG.hero });
  const dealPages  = Math.max(1, Math.ceil(topDeals.length / 4));
  const dealSlider = useAutoSlider({ total: dealPages, config: SLIDER_CONFIG.productCarousel });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Location is not supported in this browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const geo   = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const label = geo.displayName || [geo.city, geo.state, geo.pincode].filter(Boolean).join(', ');
          setLocationLabel(label);
          localStorage.setItem('deliveryLocation', label);
        } catch {
          setLocationLabel('Location detected, address lookup failed.');
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-4">

        {/* Error message */}
        {error && (
          <div className="card" style={{
            borderColor: 'var(--error)', background: 'var(--error-bg)',
            padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12,
          }}>
            <span style={{ color: 'var(--error)' }}>{error}</span>
            <button onClick={() => window.location.reload()} className="btn-subtle">
              <FiRefreshCw /> Retry
            </button>
          </div>
        )}

        {/* ── Hero Banner ─────────────────────────────────────────────────────
            FIXES applied to the banner section:

            FIX 1 — "Allen" word was hidden behind the product image
            Old: words[0] was colored orange but maxWidth:560 on text div
                 meant the text div was too wide and overlapped the image area.
                 On mobile the image starts at ~54% from left, so words[0]
                 went behind the image and became invisible.
            New: text div maxWidth changed to '52%' (percentage not px)
                 so it always stays strictly on the left half regardless of
                 screen size. Added paddingRight:12 so text never touches image.

            FIX 2 — Font size too large on mobile
            Old: fontSize: 'clamp(24px, 5vw, 44px)' — 44px is too big even
                 on small screens when 5vw resolves to something large.
            New: fontSize: 'clamp(13px, 3.5vw, 26px)' — 13px minimum on very
                 small screens, 26px max so text never overflows into image.

            FIX 3 — Text heading limited to 4 lines with ellipsis
            Old: no line clamping — very long product names took up all space
                 and pushed the CTA button off screen.
            New: WebkitLineClamp: 4 — max 4 lines, then '...'

            FIX 4 — Subtext limited to 2 lines
            Old: full description shown — could be very long
            New: WebkitLineClamp: 2 and font size reduced to 11px on mobile

            FIX 5 — textShadow added so white text is readable on any bg color
            Old: no text shadow — on light orange banner bg the white text
                 had low contrast and was hard to read.
            New: textShadow: '0 1px 6px rgba(0,0,0,0.4)' on all text        */}

        {loading ? (
          <div className="skeleton" style={{ height: 320, borderRadius: 'var(--r-xl)' }} />
        ) : banners.length > 0 ? (
          <section
            className="slider-wrap hero-banner"
            onMouseEnter={heroSlider.pause}
            onMouseLeave={heroSlider.resume}
            style={{ minHeight: 320 }}
          >
            <div
              className="slider-track"
              style={{ transform: `translateX(-${heroSlider.current * 100}%)`, height: '100%' }}
            >
              {banners.map(banner => {
                const words = String(banner.heading).trim().split(/\s+/);

                // Decide if first word should be highlighted in orange.
                // Only highlight if first word is a short brand name (<= 10 chars)
                // and there are more words after it. This prevents very long
                // first words from being highlighted and still getting cut off.
                const highlightFirst = words.length > 1 && words[0].length <= 10;

                return (
                  <div
                    key={banner.id}
                    style={{
                      width: '100%',
                      flexShrink: 0,
                      minHeight: 320,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      // FIX: reduced padding on mobile so text has more room
                      padding: 'clamp(18px, 4vw, 36px)',
                    }}
                  >
                    {/* Text content — strictly left side, never overlaps image */}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        // FIX 1: was maxWidth:560 (fixed px) — on narrow screens
                        // this was wider than 50% so text went over the image.
                        // Now using 52% so it always stays on the left half.
                        maxWidth: '52%',
                        paddingRight: 12,
                      }}
                    >
                      {/* Category label */}
                      <p style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'rgba(255,255,255,0.80)',
                        marginBottom: 6,
                        // FIX 5: text shadow for readability
                        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      }}>
                        {banner.label}
                      </p>

                      {/* Product name heading */}
                      <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        // FIX 2: was clamp(24px,5vw,44px) — too large on mobile
                        fontSize: 'clamp(13px, 3.5vw, 26px)',
                        color: '#fff',
                        lineHeight: 1.2,
                        marginBottom: 8,
                        // FIX 3: limit to 4 lines so long names don't push CTA away
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        // FIX 5: text shadow
                        textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                      }}>
                        {highlightFirst ? (
                          // FIX 1: first word highlighted only when it is short
                          // so it doesn't risk getting cut off by the image
                          <>
                            <span style={{ color: 'var(--primary)' }}>{words[0]}</span>
                            {' '}{words.slice(1).join(' ')}
                          </>
                        ) : (
                          // Full name in white if first word is too long
                          banner.heading
                        )}
                      </h1>

                      {/* Subtext — product description snippet */}
                      <p style={{
                        color: 'rgba(255,255,255,0.82)',
                        // FIX 4: was no size set — now smaller on mobile
                        fontSize: 'clamp(10px, 2vw, 13px)',
                        lineHeight: 1.45,
                        marginBottom: 14,
                        // FIX 4: limit to 2 lines
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: '0 1px 4px rgba(0,0,0,0.35)',
                      }}>
                        {banner.subtext}
                      </p>

                      <Link
                        to={banner.ctaUrl}
                        className="btn-ghost-white"
                        style={{
                          display: 'inline-block',
                          // FIX: smaller padding on mobile so button fits
                          padding: 'clamp(8px, 2vw, 14px) clamp(14px, 3vw, 24px)',
                          fontSize: 'clamp(11px, 2vw, 14px)',
                        }}
                      >
                        {banner.ctaText}
                      </Link>
                    </div>

                    {/* Product image — right side, never overlaps text */}
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt=""
                        style={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          height: '90%',
                          // FIX: was maxWidth:'46%' — keeping it to 46% ensures
                          // the image never takes more than its half of the banner
                          maxWidth: '46%',
                          objectFit: 'contain',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Prev / Next arrows */}
            <button className="slider-arrow prev" onClick={heroSlider.prev}>
              <FiChevronLeft />
            </button>
            <button className="slider-arrow next" onClick={heroSlider.next}>
              <FiChevronRight />
            </button>

            {/* Slide counter top-right */}
            <div style={{
              position: 'absolute', right: 14, top: 12,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 12,
            }}>
              {String(heroSlider.current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
            </div>

            {/* Dot indicators bottom-center */}
            <div className="slider-dots" style={{ position: 'absolute', bottom: 14, left: 0, right: 0 }}>
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === heroSlider.current ? 'active' : ''}`}
                  onClick={() => heroSlider.goTo(index)}
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

        {/* Category pills */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
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

        {/* Delivery location card */}
        <div className="card" style={{
          padding: 16,
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 14,
        }}>
          <div>
            <h2 className="section-heading-left">{sectionCopy.locationTitle}</h2>
            <p style={{ marginTop: 4 }}>{locationLabel || sectionCopy.locationFallback}</p>
          </div>
          <button onClick={detectLocation} className="btn-ghost">
            {detectingLocation
              ? <FiRefreshCw className="animate-spin" />
              : <FiNavigation />
            }
            {' '}{sectionCopy.detectLocation}
          </button>
        </div>

        {/* Trust badges */}
        <div className="stats-grid">
          {TRUST_BADGES.map((badge, index) => (
            <div
              key={badge.text}
              className="card"
              style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <FiShield color="var(--primary)" />
              <p style={{
                fontWeight: 700,
                color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
                {badge.text}
              </p>
            </div>
          ))}
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiTruck color="var(--primary)" />
            <p style={{ fontWeight: 700 }}>Fast delivery on available items</p>
          </div>
        </div>

        {/* Trending products */}
        <HomeSection title={sectionCopy.trending} products={filteredProducts} loading={loading} />

        {/* Top deals slider */}
        {!loading && topDeals.length > 0 && (
          <section
            className="card slider-wrap"
            onMouseEnter={dealSlider.pause}
            onMouseLeave={dealSlider.resume}
            style={{ padding: 20 }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: 16, marginBottom: 18,
            }}>
              <h2 className="section-heading-left">{sectionCopy.deals}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: dealPages }).map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${index === dealSlider.current ? 'active' : ''}`}
                    onClick={() => dealSlider.goTo(index)}
                  />
                ))}
              </div>
            </div>
            <div className="slider-track" style={{ transform: `translateX(-${dealSlider.current * 100}%)` }}>
              {Array.from({ length: dealPages }).map((_, page) => (
                <div key={page} className="product-grid" style={{ width: '100%', flexShrink: 0 }}>
                  
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiNavigation, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import ProductCard, { ProductCardSkeleton } from '../components/Product/ProductCard';
import api from '../utils/api';
import { reverseGeocode } from '../utils/location';
import { EMPTY_STATES, TRUST_BADGES } from '../constants/labels';
import { ROUTE } from '../constants/routes';
import { SLIDER_CONFIG } from '../constants/sliderConfig';
import { useAutoSlider } from '../hooks/useAutoSlider';

const sectionCopy = {
  heroLabel: 'Fresh picks',
  heroCta: 'Shop now',
  locationTitle: 'Delivery location',
  locationFallback: 'Detect your area for delivery estimates.',
  detectLocation: 'Detect location',
  trending: 'Trending Products',
  deals: 'Top Deals',
  recent: 'Recently Viewed',
  newsletterTitle: 'Get the best deals first',
  newsletterText: 'Fresh offers, product drops, and order updates in one tidy place.',
  subscribe: 'Subscribe',
};

const HomeSection = ({ title, products, loading }) => {
  if (loading) {
    return (
      <section className="card" style={{ padding: 20 }}>
        <h2 className="section-heading-left">{title}</h2>
        <div className="product-grid" style={{ marginTop: 18 }}>
          {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
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
          <motion.div key={product.productId || product.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.03 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [locationLabel, setLocationLabel] = useState(localStorage.getItem('deliveryLocation') || '');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/products?page=0&size=80');
        setProducts(res.data?.content || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError('Products load nahi ho pa rahe. Backend check karo.');
      } finally {
        setLoading(false);
      }
    };
    load();
    setRecentProducts(JSON.parse(localStorage.getItem('recentProducts') || '[]'));
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map(product => product.category).filter(Boolean))];
    return [{ id: null, name: 'All' }, ...unique.map(name => ({ id: name, name }))];
  }, [products]);

  const filteredProducts = useMemo(() => activeCategory ? products.filter(product => product.category === activeCategory) : products, [activeCategory, products]);

  const topDeals = useMemo(() => [...products].sort((a, b) => {
    const da = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
    const db = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
    return db - da;
  }), [products]);

  const banners = useMemo(() => {
    const source = products.slice(0, 4);
    return source.length ? source.map(product => ({
      id: product.productId || product.id,
      label: product.category || sectionCopy.heroLabel,
      heading: product.productName || product.name,
      subtext: product.description || TRUST_BADGES[0]?.text,
      ctaText: sectionCopy.heroCta,
      ctaUrl: ROUTE.product(product.productId || product.id),
      image: product.images?.[0] || product.imageUrl,
    })) : [];
  }, [products]);

  const heroSlider = useAutoSlider({ total: banners.length, config: SLIDER_CONFIG.hero });
  const dealPages = Math.max(1, Math.ceil(topDeals.length / 4));
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
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
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

  const subscribe = (event) => {
    event.preventDefault();
    setEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-4">
        {error && (
          <div className="card" style={{ borderColor: 'var(--error)', background: 'var(--error-bg)', padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ color: 'var(--error)' }}>{error}</span>
            <button onClick={() => window.location.reload()} className="btn-subtle"><FiRefreshCw /> Retry</button>
          </div>
        )}

        {loading ? (
          <div className="skeleton" style={{ height: 280, borderRadius: 'var(--r-xl)' }} />
        ) : banners.length > 0 ? (
          <section className="slider-wrap hero-banner" onMouseEnter={heroSlider.pause} onMouseLeave={heroSlider.resume} style={{ minHeight: 280 }}>
            <div className="slider-track" style={{ transform: `translateX(-${heroSlider.current * 100}%)`, height: '100%' }}>
              {banners.map(banner => {
                const words = String(banner.heading || '').split(' ');
                return (
                  <div key={banner.id} style={{ width: '100%', flexShrink: 0, minHeight: 280, position: 'relative', display: 'flex', alignItems: 'center', padding: 28 }}>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: 560 }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>{banner.label}</p>
                      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,4vw,36px)', color: '#fff' }}>
                        <span style={{ color: 'var(--accent)' }}>{words[0]}</span> {words.slice(1).join(' ')}
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 12, maxWidth: 460 }}>{banner.subtext}</p>
                      <Link to={banner.ctaUrl} className="btn-ghost-white" style={{ marginTop: 18 }}>{banner.ctaText}</Link>
                    </div>
                    {banner.image && <img src={banner.image} alt="" style={{ position: 'absolute', right: 0, bottom: 0, height: '86%', maxWidth: '42%', objectFit: 'contain', zIndex: 1 }} />}
                  </div>
                );
              })}
            </div>
            <button className="slider-arrow prev" onClick={heroSlider.prev}><FiChevronLeft /></button>
            <button className="slider-arrow next" onClick={heroSlider.next}><FiChevronRight /></button>
            <div style={{ position: 'absolute', right: 18, top: 16, color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>
              {String(heroSlider.current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
            </div>
            <div className="slider-dots" style={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}>
              {banners.map((_, index) => <button key={index} className={`slider-dot ${index === heroSlider.current ? 'active' : ''}`} onClick={() => heroSlider.goTo(index)} />)}
            </div>
          </section>
        ) : (
          <div className="empty-state card">
            <div className="empty-state-icon">{EMPTY_STATES.products.icon}</div>
            <div className="empty-state-title">{EMPTY_STATES.products.title}</div>
            <div className="empty-state-sub">{EMPTY_STATES.products.sub}</div>
          </div>
        )}

        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map(category => (
            <button key={category.name} className={`category-pill ${category.id === activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(category.id)}>
              {category.name}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h2 className="section-heading-left">{sectionCopy.locationTitle}</h2>
            <p style={{ marginTop: 4 }}>{locationLabel || sectionCopy.locationFallback}</p>
          </div>
          <button onClick={detectLocation} className="btn-ghost">
            {detectingLocation ? <FiRefreshCw className="animate-spin" /> : <FiNavigation />} {sectionCopy.detectLocation}
          </button>
        </div>

        <div className="stats-grid">
          {TRUST_BADGES.map((badge, index) => (
            <div key={badge.text} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FiShield color="var(--primary)" />
              <p style={{ fontWeight: 700, color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{badge.text}</p>
            </div>
          ))}
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiTruck color="var(--primary)" />
            <p style={{ fontWeight: 700 }}>Fast delivery on available items</p>
          </div>
        </div>

        <HomeSection title={sectionCopy.trending} products={filteredProducts} loading={loading} />

        {!loading && topDeals.length > 0 && (
          <section className="card slider-wrap" onMouseEnter={dealSlider.pause} onMouseLeave={dealSlider.resume} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <h2 className="section-heading-left">{sectionCopy.deals}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: dealPages }).map((_, index) => <button key={index} className={`slider-dot ${index === dealSlider.current ? 'active' : ''}`} onClick={() => dealSlider.goTo(index)} />)}
              </div>
            </div>
            <div className="slider-track" style={{ transform: `translateX(-${dealSlider.current * 100}%)` }}>
              {Array.from({ length: dealPages }).map((_, page) => (
                <div key={page} className="product-grid" style={{ width: '100%', flexShrink: 0 }}>
                  {topDeals.slice(page * 4, page * 4 + 4).map(product => <ProductCard key={product.productId || product.id} product={product} />)}
                </div>
              ))}
            </div>
            <button className="slider-arrow prev" onClick={dealSlider.prev}><FiChevronLeft /></button>
            <button className="slider-arrow next" onClick={dealSlider.next}><FiChevronRight /></button>
          </section>
        )}

        <HomeSection title={sectionCopy.recent} products={recentProducts} loading={false} />

        <section className="newsletter-strip" style={{ borderRadius: 'var(--r-xl)' }}>
          <h2 style={{ color: 'var(--footer-heading)' }}>{sectionCopy.newsletterTitle}</h2>
          <p style={{ color: 'var(--footer-text)' }}>{sectionCopy.newsletterText}</p>
          <form className="newsletter-input-wrap" onSubmit={subscribe}>
            <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email address" required />
            <button className="btn-primary" type="submit">{sectionCopy.subscribe}</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HomePage;

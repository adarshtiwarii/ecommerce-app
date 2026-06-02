import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IMG_FALLBACK } from '../../utils/imgFallback';
import { useApp } from '../../context/AppContext';

const SLIDES = [
  {
    id: 'deals',
    eyebrow: 'Big Saving Days',
    title: 'Best Deals From',
    titleAccent: 'Trusted Sellers',
    subtitle: 'Shop mobiles, fashion, home essentials and more at strong prices.',
    cta: 'Explore Deals',
    link: '/search?q=',
    bg: 'linear-gradient(135deg,#1a2a1a 0%,#0f1f0f 60%,#060606 100%)',
    accent: '#22C55E',
    tag: 'Up to 80% OFF',
  },
  {
    id: 'electronics',
    eyebrow: 'Smart Picks',
    title: 'Electronics Offers',
    titleAccent: 'Are Live',
    subtitle: 'Fresh gadgets, accessories and daily-use tech in one place.',
    cta: 'Shop Electronics',
    link: '/category/Electronics',
    bg: 'linear-gradient(135deg,#0d1a2e 0%,#091628 60%,#060606 100%)',
    accent: '#3B82F6',
    tag: 'New Arrivals',
  },
  {
    id: 'fashion',
    eyebrow: 'Style Refresh',
    title: 'New Fashion Drops',
    titleAccent: 'Every Season',
    subtitle: 'Trending essentials with clean product photos and quick checkout.',
    cta: 'Shop Fashion',
    link: '/category/Fashion',
    bg: 'linear-gradient(135deg,#2a1a2e 0%,#1a0f28 60%,#060606 100%)',
    accent: '#EC4899',
    tag: 'Trending Now',
  },
];

const Banner = ({ products = [] }) => {
  const { user } = useApp();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const featuredImages = useMemo(
    () => products.slice(0, 8).map(product => product.images?.[0] || product.imageUrl).filter(Boolean),
    [products]
  );

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = SLIDES[current];
  const start = (current * 2) % Math.max(featuredImages.length - 2, 1);
  const images = featuredImages.length >= 3
    ? featuredImages.slice(start, start + 3)
    : [IMG_FALLBACK, IMG_FALLBACK, IMG_FALLBACK];

  return (
    <section
      className="relative overflow-hidden rounded-xl"
      style={{ background: slide.bg, border: `1px solid ${slide.accent}30`, minHeight: 300 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid items-center gap-5 px-5 py-7 sm:grid-cols-[1fr_auto] sm:px-10 sm:py-9">
        <div className="max-w-lg">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-black uppercase" style={{ color: slide.accent, border: `1px solid ${slide.accent}55` }}>
              {slide.eyebrow}
            </span>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ color: slide.accent, border: `1px solid ${slide.accent}35` }}>
              {slide.tag}
            </span>
          </div>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-5xl">
            <span className="block">{slide.title}</span>
            <span className="block" style={{ color: slide.accent }}>{slide.titleAccent}</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">{slide.subtitle}</p>
          {!isAdmin && <Link to={slide.link} className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black" style={{ background: slide.accent, color: '#000' }}>
            {slide.cta}
            <FiArrowRight />
          </Link>}
        </div>

        <div className="hidden grid-cols-3 gap-3 sm:grid">
          {images.map((image, index) => (
            <div key={`${slide.id}-${index}`} className="flex h-28 w-28 items-center justify-center rounded-md border border-white/10 bg-white/5 p-3">
              <img src={image} alt="" className="h-full w-full object-contain" onError={event => { event.currentTarget.src = IMG_FALLBACK; }} />
            </div>
          ))}
        </div>
      </div>

      <button className="slider-arrow prev" onClick={() => setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length)} aria-label="Previous banner">
        <FiChevronLeft />
      </button>
      <button className="slider-arrow next" onClick={() => setCurrent(prev => (prev + 1) % SLIDES.length)} aria-label="Next banner">
        <FiChevronRight />
      </button>
    </section>
  );
};

export default Banner;

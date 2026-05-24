// src/components/Home/Banner.js
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { IMG_FALLBACK } from '../../utils/imgFallback';

const SLIDES = [
  {
    id: 'deals',
    eyebrow: '🔥 Big Saving Days',
    title: 'Best Deals From',
    titleAccent: 'Trusted Sellers',
    subtitle: 'Shop mobiles, fashion, home essentials and more — best prices guaranteed.',
    cta: 'Explore Deals',
    link: '/search?q=',
    bg: 'linear-gradient(135deg,#1a2a1a 0%,#0f1f0f 60%,#060606 100%)',
    accent: '#22C55E',
    glow: 'rgba(34,197,94,0.12)',
    tag: '🏷️ Up to 80% OFF',
  },
  {
    id: 'electronics',
    eyebrow: '⚡ Smart Picks',
    title: 'Electronics Offers',
    titleAccent: 'Are Live',
    subtitle: 'Fresh gadgets, accessories and daily-use tech — all in one place.',
    cta: 'Shop Electronics',
    link: '/category/Electronics',
    bg: 'linear-gradient(135deg,#0d1a2e 0%,#091628 60%,#060606 100%)',
    accent: '#3B82F6',
    glow: 'rgba(59,130,246,0.12)',
    tag: '✨ New Arrivals',
  },
  {
    id: 'fashion',
    eyebrow: '✨ Style Refresh',
    title: 'New Fashion Drops',
    titleAccent: 'Every Season',
    subtitle: 'Trending essentials with clean product photos and quick checkout.',
    cta: 'Shop Fashion',
    link: '/category/Fashion',
    bg: 'linear-gradient(135deg,#2a1a2e 0%,#1a0f28 60%,#060606 100%)',
    accent: '#EC4899',
    glow: 'rgba(236,72,153,0.12)',
    tag: '🔥 Trending Now',
  },
  {
    id: 'eco',
    eyebrow: '🌿 Eco Special',
    title: 'Sustainable Living',
    titleAccent: 'At Best Prices',
    subtitle: 'Certified eco-friendly products at every price point.',
    cta: 'Go Green',
    link: '/category/Home',
    bg: 'linear-gradient(135deg,#0d2a1a 0%,#071f10 60%,#060606 100%)',
    accent: '#10B981',
    glow: 'rgba(16,185,129,0.12)',
    tag: '🌱 Eco Certified',
  },
];

const TRUST_BADGES = [
  { icon: '🔒', label: 'Secure Payments'        },
  { icon: '🚚', label: 'Free Delivery on ₹499+' },
  { icon: '↩️', label: '7-Day Easy Returns'      },
  { icon: '✅', label: 'Verified Sellers'        },
];

const Banner = ({ products = [] }) => {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const featuredImages = useMemo(
    () => products.slice(0, 8).map(p => p.images?.[0] || p.imageUrl).filter(Boolean),
    [products]
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = SLIDES[current];

  const imgs = featuredImages.length >= 3
    ? featuredImages.slice(
        (current * 2) % Math.max(featuredImages.length - 2, 1),
        (current * 2) % Math.max(featuredImages.length - 2, 1) + 3
      )
    : [IMG_FALLBACK, IMG_FALLBACK, IMG_FALLBACK];

  return (
    <div style={{ width: '100%' }}>

      {/* ════ MAIN BANNER ════ */}
      <section
        className="relative overflow-hidden rounded-xl"
        style={{
          background: slide.bg,
          border: `1px solid ${slide.accent}20`,
          minHeight: 300,          /* medium height */
          transition: 'background 0.6s ease, border-color 0.5s ease',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: -40, left: -40,
          width: 320, height: 320, borderRadius: '50%',
          background: slide.glow, filter: 'blur(70px)',
          pointerEvents: 'none', transition: 'background 0.6s ease',
        }} />

        {/* Subtle grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(135deg,
            ${slide.accent} 0px, ${slide.accent} 1px,
            transparent 1px, transparent 30px)`,
        }} />

        {/* Slide counter */}
        <div style={{
          position: 'absolute', top: 14, right: 14, zIndex: 10,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 99, padding: '3px 10px',
          fontSize: 10, color: 'rgba(255,255,255,0.50)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {String(current + 1).padStart(2,'0')} / {String(SLIDES.length).padStart(2,'0')}
        </div>

        {/* ── Content: 2-col ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: 20,
          padding: '36px 40px',   /* medium padding */
          position: 'relative', zIndex: 2,
        }}
        className="max-sm:flex max-sm:flex-col max-sm:px-5 max-sm:py-7"
        >

          {/* LEFT: text */}
          <div style={{ maxWidth: 500 }}>

            {/* Eyebrow + tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{
                background: `${slide.accent}18`,
                border: `1px solid ${slide.accent}40`,
                color: slide.accent,
                borderRadius: 99, padding: '4px 12px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
                textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
              }}>
                {slide.eyebrow}
              </span>
              <span style={{
                background: `${slide.accent}14`,
                border: `1px solid ${slide.accent}28`,
                color: slide.accent,
                borderRadius: 99, padding: '4px 10px',
                fontSize: 11, fontWeight: 600,
              }}>
                {slide.tag}
              </span>
            </div>

            {/* Headline — CLEAR & VISIBLE */}
            <h1 style={{
              fontFamily: 'Syne, system-ui',
              fontSize: 'clamp(28px, 3.5vw, 46px)',   /* medium font size */
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              marginBottom: 10,
            }}>
              <span style={{ color: '#F3F4F6', display: 'block' }}>
                {slide.title}
              </span>
              <span style={{ color: slide.accent, display: 'block' }}>
                {slide.titleAccent}
              </span>
            </h1>

            {/* Subtitle — fully visible */}
            <p style={{
              fontSize: 'clamp(13px, 1.3vw, 15px)',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.65,
              marginBottom: 24,
              maxWidth: 440,
            }}>
              {slide.subtitle}
            </p>

            {/* CTA */}
            <Link
              to={slide.link}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: slide.accent, color: '#000',
                borderRadius: 99, padding: '11px 24px',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 0 20px ${slide.accent}35`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 24px ${slide.accent}50`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 0 20px ${slide.accent}35`;
              }}
            >
              {slide.cta}
              <FiArrowRight size={15} />
            </Link>
          </div>

          {/* RIGHT: product image cards (desktop only) */}
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, flexShrink: 0 }}
            className="max-sm:hidden"
          >
            {imgs.map((img, idx) => (
              <div key={`${slide.id}-${idx}`} style={{
                width: 110, height: 110,   /* medium card size */
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 10, overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.40)',
                transform: idx === 1 ? 'translateY(-10px)' : 'translateY(0)',
                transition: 'transform 0.3s ease',
              }}>
                <img
                  src={img}
                  alt=""
                  style={{
                    width: '100%', height: '100%', objectFit: 'contain',
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
                  }}
                  onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: 14, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 5, zIndex: 10,
        }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              style={{
                height: 5, borderRadius: 99,
                width: i === current ? 20 : 5,
                background: i === current ? slide.accent : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        {[
          { pos: 'left',  fn: () => setCurrent(p => (p - 1 + SLIDES.length) % SLIDES.length), icon: <FiChevronLeft size={18} /> },
          { pos: 'right', fn: () => setCurrent(p => (p + 1) % SLIDES.length),                 icon: <FiChevronRight size={18} /> },
        ].map(btn => (
          <button
            key={btn.pos}
            onClick={btn.fn}
            className="hidden sm:flex"
            style={{
              position: 'absolute',
              top: '50%', transform: 'translateY(-50%)',
              [btn.pos]: 12,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#fff', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 10, transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.80)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
          >
            {btn.icon}
          </button>
        ))}
      </section>

      {/* ════ TRUST BADGE STRIP ════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${TRUST_BADGES.length}, 1fr)`,
        marginTop: 3,
        borderRadius: 10, overflow: 'hidden',
        border: '1px solid #1F2937',
      }}>
        {TRUST_BADGES.map((b, i) => (
          <div key={b.label} style={{
            background: i % 2 === 0 ? '#111827' : '#0B0B0B',
            padding: '12px 10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            borderRight: i < TRUST_BADGES.length - 1 ? '1px solid #1F2937' : 'none',
          }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: '#9CA3AF', whiteSpace: 'nowrap',
            }}>
              {b.label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Banner;
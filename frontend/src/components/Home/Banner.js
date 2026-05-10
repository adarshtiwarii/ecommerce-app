import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { IMG_FALLBACK } from '../../utils/imgFallback';

const defaultSlides = [
  {
    id: 'deals',
    eyebrow: 'Big saving days',
    title: 'Best deals from trusted sellers',
    subtitle: 'Shop mobiles, fashion, home essentials and more with live backend products.',
    cta: 'Explore Deals',
    link: '/search?q=',
    gradient: 'from-orange-500 via-orange-500 to-amber-400',
  },
  {
    id: 'electronics',
    eyebrow: 'Smart picks',
    title: 'Electronics offers are live',
    subtitle: 'Fresh gadgets, accessories, appliances and daily-use tech in one place.',
    cta: 'Shop Electronics',
    link: '/category/Electronics',
    gradient: 'from-orange-600 via-orange-500 to-yellow-400',
  },
  {
    id: 'fashion',
    eyebrow: 'Style refresh',
    title: 'New fashion drops for every cart',
    subtitle: 'Browse trending essentials with clean product photos and quick checkout.',
    cta: 'Shop Fashion',
    link: '/category/Fashion',
    gradient: 'from-amber-500 via-orange-500 to-red-400',
  },
];

const Banner = ({ products = [] }) => {
  const [current, setCurrent] = useState(0);
  const featuredImages = useMemo(
    () => products.slice(0, 6).map(p => p.images?.[0] || p.imageUrl).filter(Boolean),
    [products]
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % defaultSlides.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-sm shadow-sm border border-orange-100 bg-white">
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {defaultSlides.map((slide, slideIndex) => (
          <div key={slide.id} className={`relative w-full min-w-full bg-gradient-to-r ${slide.gradient} min-h-[230px] sm:min-h-[280px] flex items-center`}>
            <div className="relative z-10 px-5 py-7 sm:px-10 sm:py-9 max-w-2xl text-white">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-orange-100">{slide.eyebrow}</p>
              <h1 className="mt-2 text-3xl sm:text-5xl font-black leading-tight">{slide.title}</h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-orange-50">{slide.subtitle}</p>
              <Link to={slide.link} className="mt-5 inline-block rounded-sm bg-yellow-400 px-6 py-3 font-black text-orange-950 shadow hover:bg-yellow-300 transition">
                {slide.cta}
              </Link>
            </div>
            <div className="absolute right-4 bottom-3 hidden md:grid grid-cols-3 gap-3">
              {(featuredImages.length ? featuredImages : [IMG_FALLBACK, IMG_FALLBACK, IMG_FALLBACK]).slice(slideIndex, slideIndex + 3).map((img, idx) => (
                <div key={`${slide.id}-${idx}`} className="h-28 w-28 rounded-sm bg-white p-2 shadow-lg">
                  <img src={img} alt="" className="h-full w-full object-contain" onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous banner"
        onClick={() => setCurrent(p => (p - 1 + defaultSlides.length) % defaultSlides.length)}
        className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:flex"
      >
        <FiChevronLeft />
      </button>
      <button
        type="button"
        aria-label="Next banner"
        onClick={() => setCurrent(p => (p + 1) % defaultSlides.length)}
        className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:flex"
      >
        <FiChevronRight />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {defaultSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show banner ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;

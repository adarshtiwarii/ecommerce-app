import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  {
    title: 'Shop darker. Move faster.',
    text: 'Premium deals, animated browsing, secure checkout, and refund-aware orders in one sleek EcoMart experience.',
    cta: 'Explore Products',
    link: '/search?q=',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Fresh tech, fashion, home.',
    text: 'Curated products with fast delivery checks and smooth product zoom interactions.',
    cta: 'View Deals',
    link: '/search?q=deals',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    title: 'Returns that feel clear.',
    text: 'Track active orders, return requests, and refund status without hunting through pages.',
    cta: 'My Orders',
    link: '/orders',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80',
  },
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex(value => (value + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const move = (direction) => setIndex(value => (value + direction + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <section onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="relative min-h-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161616]">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/25" />
          <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-12">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#FF6B00]">EcoMart Plus</p>
            <h1 className="font-display text-4xl font-extrabold leading-[0.95] text-white sm:text-6xl lg:text-7xl">{slide.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{slide.text}</p>
            <Link to={slide.link} className="mt-7 inline-flex w-fit rounded-full bg-[#FF6B00] px-6 py-3 font-extrabold text-white shadow-[0_0_32px_rgba(255,107,0,0.28)] transition hover:bg-[#E55A00]">
              {slide.cta}
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={() => move(-1)} className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-[#161616]/10 p-3 text-white backdrop-blur transition hover:bg-[#FF6B00] sm:block"><FiChevronLeft /></button>
      <button onClick={() => move(1)} className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/10 bg-[#161616]/10 p-3 text-white backdrop-blur transition hover:bg-[#FF6B00] sm:block"><FiChevronRight /></button>
      <div className="absolute bottom-5 left-5 z-20 flex gap-2 sm:left-8 lg:left-12">
        {slides.map((item, dotIndex) => (
          <button key={item.title} onClick={() => setIndex(dotIndex)} className={`h-2 rounded-full transition-all ${dotIndex === index ? 'w-8 bg-[#FF6B00]' : 'w-2 bg-[#161616]/40'}`} />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;


import { useState, useEffect } from 'react';

const banners = [
  { id: 1, image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=300&fit=crop", title: "Big Billion Days Sale" },
  { id: 2, image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=300&fit=crop", title: "Fashion Sale" },
  { id: 3, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=300&fit=crop", title: "Electronics Sale" },
];

const Banner = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % banners.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg">
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map(banner => (
          <div key={banner.id} className="w-full flex-shrink-0 relative">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-56 sm:h-72 object-cover"
              onError={e => { e.target.src = 'https://via.placeholder.com/1200x300?text=Sale'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6">
              <span className="text-white text-xl font-bold drop-shadow-lg">{banner.title}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
      <button
        onClick={() => setCurrent(p => (p - 1 + banners.length) % banners.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % banners.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition"
      >
        ›
      </button>
    </div>
  );
};

export default Banner;
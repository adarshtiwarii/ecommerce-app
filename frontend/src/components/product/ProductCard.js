import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { IMG_FALLBACK } from '../../utils/imgFallback';

const ProductCard = ({ product }) => {
  const { addToCart, cart, toggleWishlist, isWishlisted, user } = useApp();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || product.imageUrl || IMG_FALLBACK);
  const [adding, setAdding] = useState(false);
  const productId = product.productId || product.id;
  const inCart = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted = isWishlisted(productId);
  const rating = Number(product.rating || 4.2);
  const reviews = product.reviewsCount || product.reviewCount || product.reviews || 0;
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const isAdmin = user?.role === 'ADMIN';

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQuantity === 0) return;
    setAdding(true);
    await addToCart(product);
    setAdding(false);
  };

  const handleCardClick = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    setTimeout(() => navigate(`/product/${productId}`), 400);
  };

  return (
    <motion.div ref={cardRef} onClick={handleCardClick} whileHover={{ y: -6 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="group flex h-full min-h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161616] shadow-sm transition hover:-translate-y-1 hover:border-[#FF6B00]/60 hover:shadow-[0_18px_45px_rgba(255,107,0,0.16)]">
      <div className="relative flex h-52 items-center justify-center border-b border-white/[0.08] bg-[#1E1E1E] p-3">
        {discount > 0 && <span className="absolute left-2 top-2 z-10 rounded-full bg-[#0D0D0D] px-2 py-1 text-[11px] font-black text-orange-300">{discount}% off</span>}
        {!isAdmin && (
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }} className="absolute right-2 top-2 z-10 rounded-full bg-[#161616] p-2 text-white/40 shadow transition hover:text-red-500">
            <FiHeart className={wishlisted ? 'text-red-500 fill-red-500' : ''} />
          </button>
        )}
        <div className="flex h-full w-full items-center justify-center rounded-md bg-[#161616]">
          <img src={imgSrc} alt={product.name} loading="lazy" className="max-h-[185px] max-w-full object-contain transition duration-300 group-hover:scale-110" onError={() => setImgSrc(IMG_FALLBACK)} />
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand && <p className="truncate text-[11px] font-black uppercase tracking-wide text-white/50">{product.brand}</p>}
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold text-white group-hover:text-[#FF6B00]">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 rounded-sm bg-orange-600 px-1.5 py-0.5 text-xs font-bold text-white">{rating.toFixed(1)} <FiStar size={10} fill="white" /></span>
          <span className="text-xs text-white/50">({Number(reviews).toLocaleString()})</span>
        </div>
        {product.highlights?.[0] && <p className="mt-2 line-clamp-1 text-xs text-white/50">{product.highlights[0]}</p>}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-black text-white">Rs {Number(product.price || 0).toLocaleString()}</span>
            {product.mrp > product.price && <span className="text-xs text-white/50 line-through">Rs {Number(product.mrp).toLocaleString()}</span>}
          </div>
          <p className="mt-0.5 text-xs font-semibold text-[#22C55E]">Free delivery</p>
          {!isAdmin && (
            <button onClick={handleAdd} disabled={product.stockQuantity === 0 || adding} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-black transition active:scale-95 ${product.stockQuantity === 0 ? 'bg-white/10 text-white/50' : inCart ? 'bg-[#22C55E] text-white' : 'bg-[#FF6B00] text-white hover:bg-[#E55A00]'}`}>
              <FiShoppingCart size={15} /> {product.stockQuantity === 0 ? 'Out of stock' : adding ? 'Adding...' : inCart ? 'Added' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;




import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { IMG_FALLBACK } from '../../utils/imgFallback';

const ProductCard = ({ product }) => {
  const { addToCart, cart, toggleWishlist, isWishlisted } = useApp();
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || product.imageUrl || IMG_FALLBACK);
  const [adding, setAdding] = useState(false);
  const productId = product.productId || product.id;
  const inCart = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted = isWishlisted(productId);
  const rating = Number(product.rating || 4.2);
  const reviews = product.reviewsCount || product.reviewCount || product.reviews || 0;
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (product.stockQuantity === 0) return;
    setAdding(true);
    await addToCart(product);
    setAdding(false);
  };

  return (
    <Link to={`/product/${productId}`} className="group bg-white border border-gray-200 rounded-sm hover:shadow-xl hover:border-orange-100 transition flex flex-col min-h-full overflow-hidden">
      <div className="relative h-52 bg-white flex items-center justify-center p-3 border-b border-gray-100">
        {discount > 0 && <span className="absolute left-2 top-2 z-10 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm">{discount}% off</span>}
        <button onClick={e => { e.preventDefault(); toggleWishlist(productId); }} className="absolute right-2 top-2 z-10 p-2 rounded-full bg-white shadow text-gray-400 hover:text-red-500">
          <FiHeart className={wishlisted ? 'text-red-500 fill-red-500' : ''} />
        </button>
        <div className="h-full w-full flex items-center justify-center bg-white">
          <img src={imgSrc} alt={product.name} loading="lazy" className="max-h-[185px] max-w-full object-contain transition duration-300 group-hover:scale-105" onError={() => setImgSrc(IMG_FALLBACK)} />
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand && <p className="text-[11px] uppercase text-gray-500 font-bold truncate">{product.brand}</p>}
        <h3 className="text-sm text-gray-800 font-semibold line-clamp-2 min-h-[40px] group-hover:text-orange-500">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">{rating.toFixed(1)} <FiStar size={10} fill="white" /></span>
          <span className="text-xs text-gray-500">({Number(reviews).toLocaleString()})</span>
        </div>
        {product.highlights?.[0] && <p className="text-xs text-gray-500 line-clamp-1 mt-2">{product.highlights[0]}</p>}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">Rs {Number(product.price || 0).toLocaleString()}</span>
            {product.mrp > product.price && <span className="text-xs text-gray-500 line-through">Rs {Number(product.mrp).toLocaleString()}</span>}
          </div>
          <p className="text-xs text-green-600 font-semibold mt-0.5">Free delivery</p>
          <button onClick={handleAdd} disabled={product.stockQuantity === 0 || adding} className={`mt-3 w-full py-2 rounded-sm text-sm font-black flex items-center justify-center gap-2 transition ${product.stockQuantity === 0 ? 'bg-gray-200 text-gray-500' : inCart ? 'bg-green-600 text-white' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'}`}>
            <FiShoppingCart size={15} /> {product.stockQuantity === 0 ? 'Out of stock' : adding ? 'Adding...' : inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;



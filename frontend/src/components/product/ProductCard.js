import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import StarRating from '../common/StarRating';

const ProductCard = ({ product }) => {
  const { addToCart, cart, toggleWishlist, isWishlisted } = useApp();
  const inCart = cart.some(i => i.id === product.id);
  const wishlisted = isWishlisted(product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="bg-cinematic-card border border-cinematic-border rounded-xl hover:shadow-xl transition-all duration-300 group relative flex flex-col overflow-hidden">
      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 z-10 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow hover:shadow-md transition"
      >
        <FiHeart size={18} className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
      </button>

      <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="relative overflow-hidden bg-gray-900 p-6 flex items-center justify-center h-56">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/200'}
            alt={product.name}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://via.placeholder.com/200x200?text=Product'; }}
          />
          {product.fAssured && (
            <div className="absolute bottom-2 left-2 bg-cinematic-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">
              Eco Assured
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-base font-bold text-cinematic-text line-clamp-2 mb-1 hover:text-cinematic-accent transition">
            {product.name}
          </h3>
          <div className="mb-2"><StarRating rating={product.rating || 4.3} reviews={product.reviews} /></div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold text-cinematic-text">₹{product.price?.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString()}</span>
            <span className="text-xs text-green-400 font-medium">{discount}% off</span>
          </div>
        </div>
      </Link>

      <button
        onClick={() => addToCart(product)}
        className={`mx-4 mb-4 py-2.5 rounded-lg text-sm font-bold transition ${
          inCart
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-cinematic-accent text-white hover:opacity-90'
        }`}
      >
        {inCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
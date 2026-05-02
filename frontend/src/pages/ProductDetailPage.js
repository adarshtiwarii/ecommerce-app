// src/pages/ProductDetailPage.js – cleaned version (no unused selectedImg)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/Product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const { addToCart, cart, toggleWishlist, isWishlisted } = useApp();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        if (res.data.category) {
          const simRes = await api.get(`/products/category/${res.data.category}?page=0&size=4`);
          setSimilar(simRes.data.content.filter(p => p.id !== parseInt(id)));
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const inCart = cart.some(i => i.id === product?.id);
  const wishlisted = isWishlisted(product?.id);
  const discount = product ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const checkDelivery = () => {
    if (pincode.length === 6) setDeliveryMsg(`✅ Delivery available to ${pincode} by Tomorrow`);
    else setDeliveryMsg('❌ Please enter a valid 6-digit pincode');
  };

  if (loading) return <div className="bg-fk-light min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="bg-fk-light min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="bg-fk-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="text-xs text-gray-500 mb-3 flex gap-1">
          <button onClick={() => navigate('/')} className="hover:text-fk-blue">Home</button>
          <span>/</span>
          <button onClick={() => navigate(`/category/${product.category.toLowerCase()}`)} className="hover:text-fk-blue">{product.category}</button>
          <span>/</span>
          <span className="text-gray-700">{product.name.substring(0, 30)}...</span>
        </nav>

        <div className="bg-white rounded shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {/* Images */}
            <div className="md:col-span-2 p-4 md:border-r">
              <div className="flex items-center justify-center bg-gray-50 rounded h-80 mb-3 relative">
                <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name}
                  className="h-full object-contain p-4"
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x400?text=Product'; }} />
                <button onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow">
                  <FiHeart size={20} className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                </button>
              </div>
              {/* You can add thumbnails here if product.images exists */}
              <div className="flex gap-3 mt-6">
                <button onClick={() => { addToCart(product); navigate('/cart'); }}
                  className="flex-1 bg-fk-orange text-white py-3 rounded font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 transition">
                  ⚡ BUY NOW
                </button>
                <button onClick={() => addToCart(product)}
                  className={`flex-1 py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition ${inCart ? 'bg-fk-orange text-white' : 'bg-fk-blue text-white hover:bg-blue-700'}`}>
                  <FiShoppingCart size={16} />
                  {inCart ? 'Go to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-3 p-4 md:p-6">
              <h1 className="text-xl font-medium text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating || 4.3} reviews={product.reviews || 1234} />
                {product.fAssured && <span className="bg-fk-blue text-white text-xs font-bold px-2 py-0.5 rounded">F Assured ✓</span>}
              </div>

              <div className="bg-gray-50 rounded p-3 mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-lg line-through">₹{product.mrp?.toLocaleString()}</span>
                  <span className="text-fk-green font-bold text-lg">{discount}% off</span>
                </div>
                <p className="text-fk-green text-sm mt-1">You save ₹{(product.mrp - product.price).toLocaleString()}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Highlights</h3>
                <ul className="space-y-1">
                  {(product.highlights || (product.description?.split('.') || ['No highlights'])).slice(0,4).map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-fk-green mt-0.5">•</span>{h}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 p-3 border rounded">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2"><FiTruck size={16} /> Delivery</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter 6-digit pincode" value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="border rounded px-3 py-1.5 text-sm flex-1 outline-none focus:border-fk-blue" />
                  <button onClick={checkDelivery} className="text-fk-blue font-medium text-sm hover:underline">Check</button>
                </div>
                {deliveryMsg && <p className="text-sm mt-2">{deliveryMsg}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: <FiTruck size={20} />, title: 'Free Delivery', sub: 'On orders above ₹499' },
                  { icon: <FiRefreshCw size={20} />, title: '10 Day Returns', sub: 'Change of mind is ok' },
                  { icon: <FiShield size={20} />, title: '1 Year Warranty', sub: 'Manufacturer warranty' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 border rounded">
                    <div className="text-fk-blue flex justify-center mb-1">{s.icon}</div>
                    <p className="text-xs font-medium text-gray-700">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="bg-white rounded shadow-sm mt-4">
            <div className="p-4 border-b"><h2 className="text-xl font-bold text-gray-800">Similar Products</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 bg-gray-100 p-0.5">
              {similar.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
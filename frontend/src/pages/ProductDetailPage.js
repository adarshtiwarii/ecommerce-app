import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiChevronRight, FiHeart, FiShoppingCart, FiStar, FiTruck, FiRotateCcw, FiShield, FiShare2 } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { FREE_DELIVERY_MINIMUM } from '../utils/orderTotals';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, toggleWishlist, isWishlisted, user } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setSelectedImage(0);
      } catch (err) {
        console.error('Failed to fetch product', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const productId = product?.productId || product?.id || Number(id);
  const inCart = cart.some(i => (i.productId || i.id) === productId);
  const wishlisted = isWishlisted(productId);
  const images = useMemo(() => product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [IMG_FALLBACK], [product]);
  const rating = Number(product?.rating || 4.2);
  const reviews = product?.reviewsCount || product?.reviewCount || product?.reviews || 0;
  const discount = product?.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const deliveryCharge = product?.price >= FREE_DELIVERY_MINIMUM ? 0 : 40;
  const total = (Number(product?.price || 0) * quantity) + deliveryCharge;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!product || isAdmin) return;
    const recent = JSON.parse(localStorage.getItem('recentProducts') || '[]');
    const next = [product, ...recent.filter(p => (p.id || p.productId) !== productId)].slice(0, 12);
    localStorage.setItem('recentProducts', JSON.stringify(next));
  }, [product, productId, isAdmin]);

  const handleAdd = async () => {
    if (!product || product.stockQuantity === 0) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const buyNow = async () => {
    await handleAdd();
    navigate('/cart');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="bg-white border rounded-sm p-10 text-center"><h1 className="text-xl font-bold mb-2">Product not found</h1><button onClick={() => navigate('/')} className="text-orange-500 font-bold">Go home</button></div></div>;

  const specs = Array.isArray(product.specifications) ? product.specifications.filter(s => s.key && s.value) : [];

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1 overflow-hidden">
          <Link to="/" className="hover:text-orange-500">Home</Link><FiChevronRight />
          {product.category && <><Link to={`/category/${product.category}`} className="hover:text-orange-500">{product.category}</Link><FiChevronRight /></>}
          <span className="truncate">{product.name}</span>
        </div>

        <div className="bg-white border rounded-sm shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r">
            <div className="flex gap-3">
              {images.length > 1 && <div className="hidden sm:flex flex-col gap-2 w-16">{images.map((img, index) => <button key={img + index} onClick={() => setSelectedImage(index)} className={`w-16 h-16 border rounded-sm p-1 ${selectedImage === index ? 'border-orange-500' : 'border-gray-200'}`}><img src={img} alt="" className="w-full h-full object-contain" /></button>)}</div>}
              <div className="relative flex-1 min-h-[360px] flex items-center justify-center bg-white">
                {discount > 0 && <span className="absolute left-3 top-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-sm">{discount}% off</span>}
                {!isAdmin && <button onClick={() => toggleWishlist(productId)} className="absolute right-3 top-3 bg-white shadow p-2 rounded-full text-gray-400 hover:text-red-500"><FiHeart className={wishlisted ? 'text-red-500 fill-red-500' : ''} /></button>}
                <img src={images[selectedImage]} alt={product.name} className="max-h-[390px] max-w-full object-contain p-3" onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
              </div>
            </div>
            {!isAdmin && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleAdd} disabled={product.stockQuantity === 0} className="bg-yellow-400 disabled:bg-gray-200 text-gray-900 py-3 rounded-sm font-black flex justify-center items-center gap-2"><FiShoppingCart /> {added || inCart ? 'Added' : 'Add to Cart'}</button>
                <button onClick={buyNow} disabled={product.stockQuantity === 0} className="bg-orange-500 disabled:bg-gray-300 text-white py-3 rounded-sm font-black">Buy Now</button>
              </div>
            )}
            {isAdmin && <div className="mt-4 rounded-sm border border-orange-200 bg-orange-50 p-3 text-sm font-bold text-orange-700">Admin preview mode: checkout, wishlist and cart actions are hidden.</div>}
          </div>

          <div className="lg:col-span-7 p-5">
            {product.brand && <p className="text-sm text-gray-500 uppercase font-semibold">{product.brand}</p>}
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1 leading-snug">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded-sm">{rating.toFixed(1)} <FiStar fill="white" /></span>
              <span className="text-sm text-gray-500">{Number(reviews).toLocaleString()} ratings</span>
              <span className="text-sm text-orange-500 font-bold">Assured by EcoMart</span>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">Rs {Number(product.price || 0).toLocaleString()}</span>
                {product.mrp > product.price && <span className="text-lg text-gray-500 line-through">Rs {Number(product.mrp).toLocaleString()}</span>}
                {discount > 0 && <span className="text-green-600 font-bold">{discount}% off</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border rounded-sm p-3 flex gap-2"><FiTruck className="text-orange-500 shrink-0" /><div><p className="text-sm font-bold">Delivery</p><p className="text-xs text-gray-500">{deliveryCharge === 0 ? 'Free delivery' : `Rs ${deliveryCharge} delivery`}</p></div></div>
              <div className="border rounded-sm p-3 flex gap-2"><FiRotateCcw className="text-orange-500 shrink-0" /><div><p className="text-sm font-bold">Returns</p><p className="text-xs text-gray-500">7-day replacement</p></div></div>
              <div className="border rounded-sm p-3 flex gap-2"><FiShield className="text-orange-500 shrink-0" /><div><p className="text-sm font-bold">Warranty</p><p className="text-xs text-gray-500">Brand warranty</p></div></div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center border rounded-sm w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2">-</button>
                <span className="px-4 py-2 border-x font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))} className="px-3 py-2">+</button>
              </div>
              <div className="flex gap-2 flex-1">
                <input value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeMsg(''); }} placeholder="Enter delivery pincode" className="border rounded-sm px-3 py-2 flex-1" />
                <button onClick={() => setPincodeMsg(pincode.length === 6 ? 'Delivery available' : 'Enter valid 6-digit pincode')} className="text-orange-500 font-bold px-3">Check</button>
              </div>
            </div>
            {pincodeMsg && <p className={`text-sm mt-2 ${pincodeMsg.startsWith('Delivery') ? 'text-green-600' : 'text-red-600'}`}>{pincodeMsg}</p>}

            {product.highlights?.length > 0 && <div className="mt-6"><h2 className="font-bold mb-2">Highlights</h2><ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{product.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul></div>}
            {(product.productLatitude || product.productLongitude) && <div className="mt-5 rounded-sm border bg-green-50 p-3 text-sm text-green-800"><b>Product dispatch location:</b> {product.productLatitude}, {product.productLongitude}</div>}

            <div className="mt-6 border rounded-sm overflow-hidden">
              <div className="flex border-b bg-gray-50">
                {['description', 'specifications'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-bold capitalize ${activeTab === tab ? 'text-orange-500 border-b-2 border-orange-500 bg-white' : 'text-gray-600'}`}>{tab}</button>)}
              </div>
              <div className="p-4 text-sm text-gray-700">
                {activeTab === 'description' && <p>{product.description || 'No description available.'}</p>}
                {activeTab === 'specifications' && (
                  specs.length ? <table className="w-full"><tbody>{specs.map((s, i) => <tr key={i} className="border-b"><td className="py-2 text-gray-500 w-1/3">{s.key}</td><td className="py-2 font-medium">{s.value}</td></tr>)}</tbody></table> : <p>No specifications available.</p>
                )}
              </div>
            </div>

            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied'); }} className="mt-4 text-sm text-orange-500 font-bold flex items-center gap-2"><FiShare2 /> Share product</button>
            <div className="mt-4 text-sm text-gray-600">Total for {quantity} item{quantity > 1 ? 's' : ''}: <b>Rs {total.toLocaleString()}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;



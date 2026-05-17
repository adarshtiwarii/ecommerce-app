import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiChevronRight, FiHeart, FiShoppingCart, FiStar, FiTruck, FiRotateCcw, FiShield, FiShare2 } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { FREE_DELIVERY_MINIMUM } from '../utils/orderTotals';
import ProductImageZoom from '../components/Product/ProductImageZoom';

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
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

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

  const updateZoom = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>;
  if (!product) return <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]"><div className="rounded-md border bg-[#161616] p-10 text-center shadow-sm"><h1 className="mb-2 text-xl font-bold">Product not found</h1><button onClick={() => navigate('/')} className="font-bold text-orange-600">Go home</button></div></div>;

  const specs = Array.isArray(product.specifications) ? product.specifications.filter(s => s.key && s.value) : [];

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="mb-3 flex items-center gap-1 overflow-hidden text-xs text-white/50">
          <Link to="/" className="hover:text-orange-600">Home</Link><FiChevronRight />
          {product.category && <><Link to={`/category/${product.category}`} className="hover:text-orange-600">{product.category}</Link><FiChevronRight /></>}
          <span className="truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-md border border-white/[0.08] bg-[#161616] shadow-sm lg:grid-cols-12">
          <div className="border-b bg-gradient-to-b from-white to-orange-50/40 p-4 lg:col-span-5 lg:border-b-0 lg:border-r">
            <div className="flex gap-3">
              {images.length > 1 && <div className="hidden w-16 flex-col gap-2 sm:flex">{images.map((img, index) => <button key={img + index} onClick={() => setSelectedImage(index)} className={`h-16 w-16 rounded-md border p-1 transition hover:border-orange-400 hover:shadow-sm ${selectedImage === index ? 'border-orange-500 ring-2 ring-orange-100' : 'border-white/[0.08]'}`}><img src={img} alt="" className="h-full w-full object-contain" /></button>)}</div>}
              <div
                className="relative flex-1 min-h-[360px] flex items-center justify-center bg-[#161616] overflow-hidden cursor-zoom-in"
                onMouseMove={updateZoom}
                onMouseEnter={updateZoom}
                onMouseLeave={() => setZoom(prev => ({ ...prev, active: false }))}
              >
                {discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#0D0D0D] px-2 py-1 text-xs font-black text-orange-300">{discount}% off</span>}
                {!isAdmin && <button onClick={() => toggleWishlist(productId)} className="absolute right-3 top-3 bg-[#161616] shadow p-2 rounded-full text-gray-400 hover:text-red-500"><FiHeart className={wishlisted ? 'text-red-500 fill-red-500' : ''} /></button>}
                <ProductImageZoom src={images[selectedImage]} alt={product.name} />
                {zoom.active && (
                  <div
                    className="pointer-events-none absolute hidden h-36 w-36 rounded-full border-2 border-white shadow-2xl ring-1 ring-orange-200 lg:block"
                    style={{
                      left: `${zoom.x}%`,
                      top: `${zoom.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundImage: `url(${images[selectedImage]})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '240%',
                      backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                )}
              </div>
            </div>
            <p className="mt-3 hidden text-center text-xs font-semibold text-white/50 sm:block">Hover image to zoom</p>
            {!isAdmin && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={handleAdd} disabled={product.stockQuantity === 0} className="flex items-center justify-center gap-2 rounded-md bg-amber-400 py-3 font-black text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:bg-slate-200"><FiShoppingCart /> {added || inCart ? 'Added' : 'Add to Cart'}</button>
                <button onClick={buyNow} disabled={product.stockQuantity === 0} className="rounded-md bg-[#0D0D0D] py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md disabled:bg-slate-300">Buy Now</button>
              </div>
            )}
            {isAdmin && <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-700">Admin preview mode: checkout, wishlist and cart actions are hidden.</div>}
          </div>

          <div className="lg:col-span-7 p-5">
            {product.brand && <p className="text-sm font-black uppercase tracking-wide text-white/50">{product.brand}</p>}
            <h1 className="mt-1 text-xl font-black leading-snug text-white sm:text-2xl">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-sm bg-orange-600 px-2 py-1 text-sm font-bold text-white">{rating.toFixed(1)} <FiStar fill="white" /></span>
              <span className="text-sm text-white/50">{Number(reviews).toLocaleString()} ratings</span>
              <span className="text-sm font-bold text-blue-600">Assured by EcoMart</span>
            </div>

            <div className="mt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-white">Rs {Number(product.price || 0).toLocaleString()}</span>
                {product.mrp > product.price && <span className="text-lg text-white/50 line-through">Rs {Number(product.mrp).toLocaleString()}</span>}
                {discount > 0 && <span className="font-bold text-orange-600">{discount}% off</span>}
              </div>
              <p className="text-xs text-white/50 mt-1">Inclusive of all taxes</p>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex gap-2 rounded-md border p-3 transition hover:border-orange-200 hover:shadow-sm"><FiTruck className="shrink-0 text-orange-600" /><div><p className="text-sm font-bold">Delivery</p><p className="text-xs text-white/50">{deliveryCharge === 0 ? 'Free delivery' : `Rs ${deliveryCharge} delivery`}</p></div></div>
              <div className="flex gap-2 rounded-md border p-3 transition hover:border-fuchsia-200 hover:shadow-sm"><FiRotateCcw className="shrink-0 text-fuchsia-600" /><div><p className="text-sm font-bold">Returns & refund</p><p className="text-xs text-white/50">7-day return, refund after pickup check</p></div></div>
              <div className="flex gap-2 rounded-md border p-3 transition hover:border-blue-200 hover:shadow-sm"><FiShield className="shrink-0 text-blue-600" /><div><p className="text-sm font-bold">Warranty</p><p className="text-xs text-white/50">Brand warranty</p></div></div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center border rounded-sm w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2">-</button>
                <span className="px-4 py-2 border-x font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 99, q + 1))} className="px-3 py-2">+</button>
              </div>
              <div className="flex gap-2 flex-1">
                <input value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeMsg(''); }} placeholder="Enter delivery pincode" className="border rounded-sm px-3 py-2 flex-1" />
                <button onClick={() => setPincodeMsg(pincode.length === 6 ? 'Delivery available' : 'Enter valid 6-digit pincode')} className="px-3 font-bold text-orange-600">Check</button>
              </div>
            </div>
            {pincodeMsg && <p className={`text-sm mt-2 ${pincodeMsg.startsWith('Delivery') ? 'text-green-600' : 'text-red-600'}`}>{pincodeMsg}</p>}

            {product.highlights?.length > 0 && <div className="mt-6"><h2 className="font-bold mb-2">Highlights</h2><ul className="list-disc list-inside text-sm text-white/80 space-y-1">{product.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul></div>}
            {(product.productLatitude || product.productLongitude) && <div className="mt-5 rounded-md border bg-orange-50 p-3 text-sm text-orange-800"><b>Product dispatch location:</b> {product.productLatitude}, {product.productLongitude}</div>}

            <div className="mt-6 border rounded-sm overflow-hidden">
              <div className="flex border-b bg-gray-50">
                {['description', 'specifications'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-bold capitalize ${activeTab === tab ? 'border-b-2 border-orange-500 bg-[#161616] text-orange-600' : 'text-white/70'}`}>{tab}</button>)}
              </div>
              <div className="p-4 text-sm text-white/80">
                {activeTab === 'description' && <p>{product.description || 'No description available.'}</p>}
                {activeTab === 'specifications' && (
                  specs.length ? <table className="w-full"><tbody>{specs.map((s, i) => <tr key={i} className="border-b"><td className="py-2 text-white/50 w-1/3">{s.key}</td><td className="py-2 font-medium">{s.value}</td></tr>)}</tbody></table> : <p>No specifications available.</p>
                )}
              </div>
            </div>

            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied'); }} className="mt-4 flex items-center gap-2 text-sm font-bold text-orange-600"><FiShare2 /> Share product</button>
            <div className="mt-4 text-sm text-white/70">Total for {quantity} item{quantity > 1 ? 's' : ''}: <b>Rs {total.toLocaleString()}</b></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;




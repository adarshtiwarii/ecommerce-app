import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import { useApp } from '../context/AppContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, user } = useApp();
  const navigate = useNavigate();

  const deliveryCharge = totalPrice >= 499 ? 0 : 40;
  const finalPrice = totalPrice + deliveryCharge;
  const savings = cart.reduce((sum, i) => sum + (i.mrp - i.price) * i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-cinematic-dark min-h-screen flex items-center justify-center">
        <div className="bg-cinematic-card rounded-xl shadow-xl p-12 text-center max-w-md">
          <FiShoppingBag size={64} className="text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cinematic-text mb-2">Your cart is empty!</h2>
          <p className="text-cinematic-text-muted mb-6">Add items to it now.</p>
          <Link to="/" className="inline-block bg-cinematic-accent hover:opacity-90 text-white font-bold px-8 py-3 rounded-lg transition">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cinematic-dark min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-cinematic-text mb-4">My Cart ({totalItems} items)</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-cinematic-card rounded-xl shadow-md p-4">
                <div className="flex gap-4">
                  <Link to={`/product/${item.id}`}>
                    <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.name} className="w-24 h-24 object-contain bg-gray-800 rounded-lg p-1" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.id}`} className="text-base font-semibold text-cinematic-text hover:text-cinematic-accent line-clamp-2">{item.name}</Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-cinematic-text">₹{item.price.toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-xs">₹{item.mrp?.toLocaleString()}</span>
                      <span className="text-green-400 text-xs font-medium">{item.discount}% off</span>
                    </div>
                    <p className="text-xs text-green-400 mt-1">Save ₹{((item.mrp - item.price) * item.quantity).toLocaleString()}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-cinematic-border rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 transition"><FiMinus size={12} className="text-white" /></button>
                        <span className="px-4 py-1.5 text-sm font-medium bg-cinematic-card text-white border-x border-cinematic-border">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 transition"><FiPlus size={12} className="text-white" /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm transition">
                        <FiTrash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-cinematic-card rounded-xl shadow-md p-4 sticky top-20">
              <h2 className="text-gray-300 font-bold text-xs uppercase border-b border-cinematic-border pb-2 mb-3">Price Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cinematic-text-muted">Price ({totalItems} items)</span><span className="text-cinematic-text">₹{cart.reduce((s,i)=>s+i.mrp*i.quantity,0).toLocaleString()}</span></div>
                <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{savings.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-cinematic-text-muted">Delivery</span><span className={deliveryCharge===0?'text-green-400 font-semibold':''}>{deliveryCharge===0?'FREE':`₹${deliveryCharge}`}</span></div>
              </div>
              <div className="border-t border-cinematic-border my-3"></div>
              <div className="flex justify-between font-bold text-base mb-1"><span className="text-cinematic-text">Total Amount</span><span className="text-cinematic-text">₹{finalPrice.toLocaleString()}</span></div>
              <p className="text-green-400 text-sm font-medium mb-4">You will save ₹{savings.toLocaleString()} on this order</p>
              <button onClick={() => user ? navigate('/checkout') : navigate('/login')} className="w-full bg-cinematic-accent hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition">Place Order</button>
              <p className="text-xs text-gray-500 text-center mt-2">Safe and Secure Payments. Easy returns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
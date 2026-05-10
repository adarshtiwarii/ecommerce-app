import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2, FiShield, FiTruck } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { calculateOrderTotals } from '../utils/orderTotals';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, user } = useApp();
  const navigate = useNavigate();
  const { totalMRP, discount, gst, platformFee, deliveryCharge, finalPrice, freeDeliveryMinimum } = calculateOrderTotals(cart);

  if (cart.length === 0) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border rounded-sm shadow-sm p-10 text-center max-w-md w-full">
          <FiShoppingBag size={64} className="text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="text-gray-500 mt-2 mb-6">Add products to your cart and checkout here.</p>
          <Link to="/" className="inline-block bg-orange-500 text-white font-bold px-8 py-3 rounded-sm">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Cart ({totalItems} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {cart.map(item => {
              const id = item.productId || item.id;
              const name = item.productName || item.name || 'Product';
              return (
                <div key={id} className="bg-white border rounded-sm shadow-sm p-4">
                  <div className="flex gap-4">
                    <Link to={`/product/${id}`} className="w-28 h-28 bg-white border flex items-center justify-center shrink-0">
                      <img src={item.imageUrl || item.images?.[0] || IMG_FALLBACK} alt={name} className="max-w-full max-h-full object-contain p-2" onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${id}`} className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-2">{name}</Link>
                      <p className="text-xs text-gray-500 mt-1">Seller: EcoMart verified seller</p>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-xl font-bold text-gray-900">Rs {Number(item.price || 0).toLocaleString()}</span>
                        {item.mrp > item.price && <span className="text-sm text-gray-500 line-through">Rs {Number(item.mrp).toLocaleString()}</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded-sm overflow-hidden">
                          <button onClick={() => updateQuantity(id, item.quantity - 1)} className="p-2 hover:bg-gray-100"><FiMinus size={13} /></button>
                          <span className="px-4 py-1.5 border-x font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(id, item.quantity + 1)} className="p-2 hover:bg-gray-100"><FiPlus size={13} /></button>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="text-sm font-bold text-red-600 flex items-center gap-1"><FiTrash2 size={14} /> Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white border rounded-sm shadow-sm sticky top-28">
              <div className="px-4 py-3 border-b text-gray-500 font-bold text-sm uppercase">Price Details</div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span>Price ({totalItems} items)</span><span>Rs {totalMRP.toLocaleString()}</span></div>
                <div className="flex justify-between text-green-600"><span>Discount</span><span>- Rs {discount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>GST (18%)</span><span>Rs {gst.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>Rs {platformFee.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : ''}>{deliveryCharge === 0 ? 'FREE' : `Rs ${deliveryCharge}`}</span>
                </div>
                <p className="text-xs text-gray-500">Delivery is free on orders above Rs {freeDeliveryMinimum}.</p>
                <div className="border-t pt-3 flex justify-between text-lg font-bold"><span>Total Amount</span><span>Rs {finalPrice.toLocaleString()}</span></div>
                {discount > 0 && <p className="text-green-600 font-semibold">You will save Rs {discount.toLocaleString()} on this order</p>}
                <button onClick={() => (user ? navigate('/checkout') : navigate('/login'))} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-sm font-black">Place Order</button>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2"><FiShield /> Safe and secure payments</div>
                <div className="flex items-center gap-2 text-xs text-gray-500"><FiTruck /> Fast delivery on available items</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;



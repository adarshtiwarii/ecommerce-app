import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShield, FiShoppingBag, FiTrash2, FiTruck } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { calculateOrderTotals } from '../utils/orderTotals';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, user } = useApp();
  const navigate = useNavigate();
  const { totalMRP, discount, gst, platformFee, deliveryCharge, finalPrice, freeDeliveryMinimum } = calculateOrderTotals(cart);

  if (user?.role === 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] p-4">
        <div className="w-full max-w-md rounded-md border bg-[#161616] p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-white">Admin mode</h1>
          <p className="mb-6 mt-2 text-white/50">Cart and checkout are available only for customer accounts.</p>
          <button onClick={() => navigate('/admin')} className="rounded-md bg-[#0D0D0D] px-8 py-3 font-bold text-white">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] p-4">
        <div className="w-full max-w-md rounded-md border bg-[#161616] p-10 text-center shadow-sm">
          <FiShoppingBag size={64} className="mx-auto mb-4 text-orange-600" />
          <h1 className="text-2xl font-black text-white">Your cart is empty</h1>
          <p className="mb-6 mt-2 text-white/50">Add products to your cart and checkout here.</p>
          <Link to="/" className="inline-block rounded-md bg-[#0D0D0D] px-8 py-3 font-bold text-white">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-5">
      <div className="mx-auto max-w-6xl px-3 sm:px-4">
        <div className="mb-4 rounded-md bg-[#0D0D0D] p-5 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">Checkout desk</p>
          <h1 className="mt-1 text-2xl font-black">My Cart ({totalItems} items)</h1>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {cart.map(item => {
              const id = item.productId || item.id;
              const name = item.productName || item.name || 'Product';
              return (
                <div key={id} className="rounded-md border border-white/[0.08] bg-[#161616] p-4 shadow-sm">
                  <div className="flex gap-4">
                    <Link to={`/product/${id}`} className="flex h-28 w-28 shrink-0 items-center justify-center rounded-md border bg-[#161616]">
                      <img src={item.imageUrl || item.images?.[0] || IMG_FALLBACK} alt={name} className="max-h-full max-w-full object-contain p-2" onError={event => { event.target.onerror = null; event.target.src = IMG_FALLBACK; }} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${id}`} className="line-clamp-2 font-bold text-white hover:text-orange-600">{name}</Link>
                      <p className="mt-1 text-xs text-white/50">Seller: EcoMart verified seller</p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">Rs {Number(item.price || 0).toLocaleString()}</span>
                        {item.mrp > item.price && <span className="text-sm text-white/50 line-through">Rs {Number(item.mrp).toLocaleString()}</span>}
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center overflow-hidden rounded-md border">
                          <button onClick={() => updateQuantity(id, item.quantity - 1)} className="p-2 hover:bg-[#0D0D0D]"><FiMinus size={13} /></button>
                          <span className="border-x px-4 py-1.5 font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(id, item.quantity + 1)} className="p-2 hover:bg-[#0D0D0D]"><FiPlus size={13} /></button>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="flex items-center gap-1 text-sm font-bold text-red-600"><FiTrash2 size={14} /> Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside>
            <div className="sticky top-32 rounded-md border border-white/[0.08] bg-[#161616] shadow-sm">
              <div className="border-b px-4 py-3 text-sm font-black uppercase tracking-wide text-white/50">Price Details</div>
              <div className="space-y-3 p-4 text-sm">
                <div className="flex justify-between"><span>Price ({totalItems} items)</span><span>Rs {totalMRP.toLocaleString()}</span></div>
                <div className="flex justify-between text-orange-600"><span>Discount</span><span>- Rs {discount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>GST (18%)</span><span>Rs {gst.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Platform Fee</span><span>Rs {platformFee.toLocaleString()}</span></div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? 'font-bold text-orange-600' : ''}>{deliveryCharge === 0 ? 'FREE' : `Rs ${deliveryCharge}`}</span>
                </div>
                <p className="text-xs text-white/50">Delivery is free on orders above Rs {freeDeliveryMinimum}.</p>
                <div className="flex justify-between border-t pt-3 text-lg font-black"><span>Total Amount</span><span>Rs {finalPrice.toLocaleString()}</span></div>
                {discount > 0 && <p className="font-semibold text-orange-600">You will save Rs {discount.toLocaleString()} on this order</p>}
                <button onClick={() => (user ? navigate('/checkout') : navigate('/login'))} className="w-full rounded-md bg-[#0D0D0D] py-3 font-black text-white transition hover:bg-orange-600">Place Order</button>
                <div className="flex items-center gap-2 pt-2 text-xs text-white/50"><FiShield /> Safe and secure payments</div>
                <div className="flex items-center gap-2 text-xs text-white/50"><FiTruck /> Fast delivery on available items</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;


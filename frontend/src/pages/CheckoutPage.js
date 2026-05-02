import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    pincode: '',
    address: '',
    city: '',
    state: '',
    type: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = totalPrice >= 499 ? 0 : 40;
  const finalPrice = totalPrice + deliveryCharge;

  const handlePlaceOrder = async () => {
    setLoading(true);
    const orderData = {
      userId: localStorage.getItem('userId'),
      totalAmount: finalPrice,
      shippingAddress: `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`,
      paymentMethod,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    try {
      await api.post('/orders', orderData);
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Order failed', err);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="bg-cinematic-dark min-h-screen flex items-center justify-center">
        <div className="bg-cinematic-card rounded-xl shadow-xl p-8 text-center max-w-md">
          <FiCheckCircle size={72} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cinematic-text mb-2">Order Placed!</h2>
          <p className="text-cinematic-text-muted mb-2">Your order has been placed successfully.</p>
          <p className="text-xs text-gray-400 mb-6">Estimated Delivery: <strong>2-5 Business Days</strong></p>
          <button onClick={() => navigate('/')} className="bg-cinematic-accent hover:opacity-90 text-white font-bold px-6 py-2 rounded-lg transition">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cinematic-dark min-h-screen py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side: Address & Payment */}
          <div className="md:col-span-2 space-y-4">
            {/* Step 1: Address */}
            <div className="bg-cinematic-card rounded-xl shadow-md overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-cinematic-border">
                <span className="w-7 h-7 rounded-full bg-cinematic-accent text-white flex items-center justify-center text-sm font-bold">1</span>
                <span className="font-bold text-cinematic-text uppercase text-sm">Delivery Address</span>
              </div>
              {step === 1 && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cinematic-text-muted mb-1 block">Full Name *</label>
                      <input value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent" />
                    </div>
                    <div>
                      <label className="text-xs text-cinematic-text-muted mb-1 block">Phone *</label>
                      <input value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cinematic-text-muted mb-1 block">Pincode *</label>
                      <input value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent" />
                    </div>
                    <div>
                      <label className="text-xs text-cinematic-text-muted mb-1 block">City *</label>
                      <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-cinematic-text-muted mb-1 block">Address *</label>
                    <textarea value={address.address} onChange={e => setAddress({...address, address: e.target.value})} rows={2} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-cinematic-accent" />
                  </div>
                  <div>
                    <label className="text-xs text-cinematic-text-muted mb-1 block">State</label>
                    <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cinematic-accent">
                      <option value="">Select State</option>
                      {['Delhi','Maharashtra','Karnataka','Tamil Nadu','Punjab','Uttar Pradesh','Gujarat'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    {['Home','Work','Other'].map(t => (
                      <button key={t} onClick={() => setAddress({...address, type: t})} className={`px-4 py-1.5 text-sm rounded-lg border transition ${address.type === t ? 'border-cinematic-accent bg-cinematic-accent/10 text-cinematic-accent' : 'border-cinematic-border text-cinematic-text-muted hover:bg-gray-800'}`}>{t}</button>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!address.name || !address.phone || !address.pincode || !address.address} className="bg-cinematic-accent hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg text-sm transition disabled:opacity-50">Deliver Here</button>
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className="bg-cinematic-card rounded-xl shadow-md overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-cinematic-border">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-cinematic-accent text-white' : 'bg-gray-700 text-cinematic-text-muted'}`}>2</span>
                <span className="font-bold text-cinematic-text uppercase text-sm">Payment</span>
              </div>
              {step === 2 && (
                <div className="p-4">
                  <div className="space-y-3 mb-4">
                    {[
                      { id: 'upi', label: '📱 UPI', desc: 'Google Pay, PhonePe, Paytm' },
                      { id: 'card', label: '💳 Credit/Debit Card', desc: 'Visa, Mastercard, RuPay' },
                      { id: 'netbanking', label: '🏦 Net Banking', desc: 'All major banks' },
                      { id: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when delivered' },
                    ].map(m => (
                      <label key={m.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === m.id ? 'border-cinematic-accent bg-cinematic-accent/10' : 'border-cinematic-border hover:bg-gray-800'}`}>
                        <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-cinematic-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-cinematic-text">{m.label}</p>
                          <p className="text-xs text-cinematic-text-muted">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-cinematic-accent hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition">
                    {loading ? 'Placing Order...' : `Pay ₹${finalPrice.toLocaleString()}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-cinematic-card rounded-xl shadow-md p-4 sticky top-20">
              <h2 className="text-gray-300 font-bold text-xs uppercase border-b border-cinematic-border pb-2 mb-3">Order Summary</h2>
              <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <img src={item.imageUrl || 'https://via.placeholder.com/60'} alt="" className="w-12 h-12 object-contain bg-gray-800 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-cinematic-text truncate">{item.name}</p>
                      <p className="text-xs text-cinematic-text-muted">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-cinematic-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-cinematic-text-muted">Total MRP</span><span className="text-cinematic-text font-semibold">₹{cart.reduce((s,i)=>s+i.mrp*i.quantity,0).toLocaleString()}</span></div>
                <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{(cart.reduce((s,i)=>s+i.mrp*i.quantity,0)-totalPrice).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-cinematic-text-muted">Delivery</span><span className={deliveryCharge===0?'text-green-400 font-semibold':''}>{deliveryCharge===0?'FREE':`₹${deliveryCharge}`}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-cinematic-border pt-2"><span className="text-cinematic-text">Total</span><span className="text-cinematic-text">₹{finalPrice.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
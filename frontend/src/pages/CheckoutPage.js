import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { calculateOrderTotals } from '../utils/orderTotals';

const states = ['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Madhya Pradesh'];
const payments = [
  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay at your doorstep' },
];

const CheckoutPage = () => {
  const { cart, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', phone: '', pincode: '', address: '', city: '', state: '' });

  const { subtotal, totalMRP, discount, gst, platformFee, deliveryCharge, finalPrice, freeDeliveryMinimum } = calculateOrderTotals(cart);
  const update = (field, value) => setAddress(prev => ({ ...prev, [field]: value }));

  const canContinue = address.name && address.phone.length === 10 && address.pincode.length === 6 && address.address && address.city;

  const placeOrder = async () => {
    setLoading(true);
    try {
      await api.post('/orders', {
        userId: user?.id || Number(localStorage.getItem('userId')),
        totalAmount: finalPrice,
        shippingAddress: `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`,
        paymentMethod,
        items: cart.map(item => ({ productId: item.productId || item.id, quantity: item.quantity, price: item.price })),
      });
      await clearCart();
      setStep(3);
    } catch (err) {
      console.error('Order failed', err);
      alert(err.response?.data || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border rounded-sm shadow-sm p-10 text-center max-w-md w-full">
          <FiCheckCircle size={72} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Order placed successfully</h1>
          <p className="text-gray-500 mt-2">Estimated delivery in 2-5 business days.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="bg-orange-500 text-white px-6 py-3 rounded-sm font-bold">View Orders</button>
            <button onClick={() => navigate('/')} className="bg-orange-50 text-orange-600 px-6 py-3 rounded-sm font-bold">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <main className="lg:col-span-2 space-y-4">
          <section className="bg-white border rounded-sm shadow-sm">
            <div className="px-4 py-3 bg-orange-500 text-white font-bold flex items-center gap-2"><FiMapPin /> Delivery Address</div>
            {step === 1 ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={address.name} onChange={e => update('name', e.target.value)} placeholder="Full name" className="border rounded-sm px-3 py-2" />
                <input value={address.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" className="border rounded-sm px-3 py-2" />
                <input value={address.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="border rounded-sm px-3 py-2" />
                <input value={address.city} onChange={e => update('city', e.target.value)} placeholder="City" className="border rounded-sm px-3 py-2" />
                <select value={address.state} onChange={e => update('state', e.target.value)} className="border rounded-sm px-3 py-2"><option value="">Select state</option>{states.map(s => <option key={s}>{s}</option>)}</select>
                <textarea value={address.address} onChange={e => update('address', e.target.value)} placeholder="House no., street, area" className="border rounded-sm px-3 py-2 sm:col-span-2" rows={3} />
                <button disabled={!canContinue} onClick={() => setStep(2)} className="sm:col-span-2 bg-orange-500 disabled:bg-gray-300 text-white font-black py-3 rounded-sm">Deliver Here</button>
              </div>
            ) : (
              <div className="p-4 text-sm"><p className="font-bold">{address.name} - {address.phone}</p><p className="text-gray-600">{address.address}, {address.city}, {address.state} - {address.pincode}</p><button onClick={() => setStep(1)} className="text-orange-500 font-bold mt-2">Change</button></div>
            )}
          </section>

          <section className="bg-white border rounded-sm shadow-sm">
            <div className={`px-4 py-3 font-bold flex items-center gap-2 ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}><FiCreditCard /> Payment Method</div>
            {step === 2 && <div className="p-4 space-y-3">{payments.map(p => <label key={p.id} className={`flex gap-3 p-3 border rounded-sm cursor-pointer ${paymentMethod === p.id ? 'border-orange-500 bg-orange-50' : ''}`}><input type="radio" checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} /><span><b>{p.label}</b><p className="text-xs text-gray-500">{p.desc}</p></span></label>)}<button onClick={placeOrder} disabled={loading} className="w-full bg-orange-500 text-white font-black py-3 rounded-sm">{loading ? 'Placing Order...' : `Pay Rs ${finalPrice.toLocaleString()}`}</button></div>}
          </section>
        </main>

        <aside>
          <div className="bg-white border rounded-sm shadow-sm sticky top-28">
            <div className="px-4 py-3 border-b font-bold text-gray-500 uppercase text-sm">Order Summary</div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-3 border-b">
              {cart.map(item => <div key={item.productId || item.id} className="flex gap-3"><img src={item.imageUrl || item.images?.[0] || IMG_FALLBACK} alt="" className="w-14 h-14 object-contain border" /><div className="min-w-0"><p className="text-sm font-semibold line-clamp-1">{item.productName || item.name}</p><p className="text-xs text-gray-500">Qty {item.quantity} x Rs {Number(item.price || 0).toLocaleString()}</p></div></div>)}
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total MRP</span><span>Rs {totalMRP.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount</span><span>- Rs {discount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Selling Price</span><span>Rs {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>Rs {gst.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span>Rs {platformFee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : ''}>{deliveryCharge === 0 ? 'FREE' : `Rs ${deliveryCharge}`}</span></div>
              <p className="text-xs text-gray-500">Delivery is free on orders above Rs {freeDeliveryMinimum}.</p>
              <div className="border-t pt-2 flex justify-between text-lg font-bold"><span>Total</span><span>Rs {finalPrice.toLocaleString()}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;



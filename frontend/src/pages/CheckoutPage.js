import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiCreditCard, FiNavigation } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';
import { IMG_FALLBACK } from '../utils/imgFallback';
import { calculateOrderTotals } from '../utils/orderTotals';
import { INDIA_STATES_AND_UTS } from '../utils/indiaStates';
import { reverseGeocode } from '../utils/location';

const payments = [
  { id: 'razorpay', label: 'Razorpay', desc: 'UPI, cards, EMI, net banking and QR' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Subject to order value and pincode checks' },
];

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPage = () => {
  const { cart, clearCart, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', phone: '', pincode: '', address: '', city: '', state: '' });
  const [location, setLocation] = useState(null);
  const [locationMsg, setLocationMsg] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [readableLocation, setReadableLocation] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  const { subtotal, totalMRP, discount, gst, platformFee, deliveryCharge, finalPrice, freeDeliveryMinimum } = calculateOrderTotals(cart);
  const update = (field, value) => setAddress(prev => ({ ...prev, [field]: value }));

  const canContinue = address.name && address.phone.length === 10 && address.pincode.length === 6 && address.address && address.city;

  const applyReverseGeocode = async (latitude, longitude) => {
    try {
      const geo = await reverseGeocode(latitude, longitude);
      setAddress(prev => ({
        ...prev,
        pincode: prev.pincode || geo.pincode || '',
        city: prev.city || geo.city || '',
        state: prev.state || geo.state || '',
        address: prev.address || geo.street || geo.displayName || '',
      }));
      setReadableLocation(geo.displayName);
    } catch (err) {
      console.warn('Reverse geocoding failed', err);
    }
  };

  const loadDeliveryEstimate = async (latitude, longitude) => {
    try {
      const res = await api.get(`/delivery/estimate?latitude=${latitude}&longitude=${longitude}`);
      setDeliveryEstimate(res.data);
    } catch (err) {
      console.warn('Delivery estimate failed', err);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Location is not supported in this browser.');
      return;
    }
    setLocationLoading(true);
    setLocationMsg('Finding your live location...');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const coords = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setLocation(coords);
        setLocationMsg('Location linked. Converting it into a delivery address...');
        await Promise.all([
          applyReverseGeocode(coords.latitude, coords.longitude),
          loadDeliveryEstimate(coords.latitude, coords.longitude),
        ]);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationMsg('Location permission denied. You can still place the order.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitOrder = async (paymentPayload = {}) => {
    await api.post('/orders', {
      userId: user?.id || Number(localStorage.getItem('userId')),
      totalAmount: finalPrice,
      shippingAddress: `${address.address}, ${address.city}, ${address.state} - ${address.pincode}`,
      paymentMethod: paymentPayload.paymentMethod || paymentMethod,
      customerLatitude: location?.latitude,
      customerLongitude: location?.longitude,
      razorpayOrderId: paymentPayload.razorpayOrderId,
      razorpayPaymentId: paymentPayload.razorpayPaymentId,
      razorpaySignature: paymentPayload.razorpaySignature,
      items: cart.map(item => ({ productId: item.productId || item.id, quantity: item.quantity, price: item.price })),
    });
    await clearCart();
    setStep(3);
  };

  const payWithRazorpay = async () => {
    const scriptReady = await loadRazorpay();
    if (!scriptReady) {
      throw new Error('Razorpay checkout could not be loaded');
    }
    const orderRes = await api.post('/payments/razorpay/order', {
      userId: user?.id || Number(localStorage.getItem('userId')),
      items: cart.map(item => ({ productId: item.productId || item.id, quantity: item.quantity })),
    });
    const paymentOrder = orderRes.data;

    await new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amountInPaise,
        currency: paymentOrder.currency,
        name: 'Orange Market',
        description: 'Secure marketplace payment',
        order_id: paymentOrder.orderId,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email || localStorage.getItem('userEmail') || '',
        },
        theme: { color: '#FF7A00' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/razorpay/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!verifyRes.data?.verified) {
              reject(new Error('Payment verification failed'));
              return;
            }
            await submitOrder({
              paymentMethod: 'RAZORPAY',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      checkout.open();
    });
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'razorpay') {
        await payWithRazorpay();
      } else {
        await submitOrder({ paymentMethod: 'COD' });
      }
    } catch (err) {
      console.error('Order failed', err);
      alert(getErrorMessage(err, err.message || 'Failed to place order'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="bg-[#161616] border rounded-xl shadow-sm p-10 text-center max-w-md w-full">
          <FiCheckCircle size={72} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Order placed successfully</h1>
          <p className="text-white/50 mt-2">Estimated delivery in 2-5 business days.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold">View Orders</button>
            <button onClick={() => navigate('/')} className="bg-[rgba(255,107,0,0.12)] text-orange-600 px-6 py-3 rounded-xl font-bold">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <main className="lg:col-span-2 space-y-4">
          <section className="bg-[#161616] border rounded-xl shadow-sm">
            <div className="flex items-center gap-2 bg-[#FF6B00] px-4 py-3 font-bold text-white"><FiMapPin /> Delivery Address</div>
            {step === 1 ? (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={address.name} onChange={e => update('name', e.target.value)} placeholder="Full name" className="border rounded-xl px-3 py-2" />
                <input value={address.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" className="border rounded-xl px-3 py-2" />
                <input value={address.pincode} onChange={e => update('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="border rounded-xl px-3 py-2" />
                <input value={address.city} onChange={e => update('city', e.target.value)} placeholder="City" className="border rounded-xl px-3 py-2" />
                <select value={address.state} onChange={e => update('state', e.target.value)} className="border rounded-xl px-3 py-2"><option value="">Select state / UT</option>{INDIA_STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}</select>
                <textarea value={address.address} onChange={e => update('address', e.target.value)} placeholder="House no., street, area" className="border rounded-xl px-3 py-2 sm:col-span-2" rows={3} />
                <div className="rounded-xl border border-white/[0.08] bg-[#1E1E1E] p-3 sm:col-span-2">
                  <button type="button" onClick={captureLocation} disabled={locationLoading} className="flex items-center gap-2 rounded-full border border-[#FF6B00] px-5 py-2.5 text-sm font-black text-[#FF6B00] disabled:opacity-60">
                    {locationLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" /> : <FiNavigation />}
                    {locationLoading ? 'Detecting location...' : 'Use My Current Location'}
                  </button>
                  <p className="mt-2 text-xs text-white/50">Why we need this: We use your location only to auto-fill your delivery address. We do not store or track it.</p>
                  {locationMsg && <p className="mt-2 text-xs text-[#FF6B00]">{locationMsg}</p>}
                  {readableLocation && <p className="mt-2 text-xs text-white/80"><b>Detected address:</b> {readableLocation}</p>}
                  {deliveryEstimate && (
                    <p className="mt-2 text-xs text-white/80">
                      Nearest warehouse: <b>{deliveryEstimate.warehouseName}</b> ({deliveryEstimate.distanceKm} km), ETA about <b>{deliveryEstimate.estimatedHours} hours</b>.
                    </p>
                  )}
                </div>
                <button disabled={!canContinue} onClick={() => setStep(2)} className="rounded-full bg-[#FF6B00] py-3 font-black text-white disabled:bg-white/10 disabled:text-white/40 sm:col-span-2">Deliver Here</button>
              </div>
            ) : (
              <div className="p-4 text-sm"><p className="font-bold">{address.name} - {address.phone}</p><p className="text-white/70">{address.address}, {address.city}, {address.state} - {address.pincode}</p><button onClick={() => setStep(1)} className="text-orange-500 font-bold mt-2">Change</button></div>
            )}
          </section>

          <section className="bg-[#161616] border rounded-xl shadow-sm">
            <div className={`flex items-center gap-2 px-4 py-3 font-bold ${step >= 2 ? 'bg-[#FF6B00] text-white' : 'bg-[#0D0D0D] text-white/50'}`}><FiCreditCard /> Payment Method</div>
            {step === 2 && <div className="p-4 space-y-3">{payments.map(p => <label key={p.id} className={`flex gap-3 p-3 border rounded-xl cursor-pointer ${paymentMethod === p.id ? 'border-orange-500 bg-[rgba(255,107,0,0.12)]' : ''}`}><input type="radio" checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} /><span><b>{p.label}</b><p className="text-xs text-white/50">{p.desc}</p></span></label>)}<button onClick={placeOrder} disabled={loading} className="w-full bg-[#FF6B00] text-white font-black py-3 rounded-xl">{loading ? 'Processing...' : paymentMethod === 'razorpay' ? `Pay Securely - Rs ${finalPrice.toLocaleString()}` : `Place COD Order - Rs ${finalPrice.toLocaleString()}`}</button></div>}
          </section>
        </main>

        <aside>
          <div className="sticky top-28 rounded-xl border border-white/[0.08] bg-[#161616] shadow-sm">
            <div className="px-4 py-3 border-b font-bold text-white/50 uppercase text-sm">Order Summary</div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-3 border-b">
              {cart.map(item => <div key={item.productId || item.id} className="flex gap-3"><img src={item.imageUrl || item.images?.[0] || IMG_FALLBACK} alt="" className="w-14 h-14 object-contain border" /><div className="min-w-0"><p className="text-sm font-semibold line-clamp-1">{item.productName || item.name}</p><p className="text-xs text-white/50">Qty {item.quantity} x Rs {Number(item.price || 0).toLocaleString()}</p></div></div>)}
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total MRP</span><span>Rs {totalMRP.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Discount</span><span>- Rs {discount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Selling Price</span><span>Rs {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>Rs {gst.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span>Rs {platformFee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : ''}>{deliveryCharge === 0 ? 'FREE' : `Rs ${deliveryCharge}`}</span></div>
              <p className="text-xs text-white/50">Delivery is free on orders above Rs {freeDeliveryMinimum}.</p>
              <div className="border-t pt-2 flex justify-between text-lg font-bold"><span>Total</span><span>Rs {finalPrice.toLocaleString()}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;






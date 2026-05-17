import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiMapPin, FiPackage, FiRefreshCw, FiRotateCcw, FiShoppingBag, FiTruck, FiXCircle } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';
import { IMG_FALLBACK } from '../utils/imgFallback';

const OrdersPage = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [reasonAction, setReasonAction] = useState(null);
  const [submittingReason, setSubmittingReason] = useState(false);

  const loadOrders = async () => {
    const userId = user?.id || Number(localStorage.getItem('userId'));
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/my?userId=${userId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);

      const ids = [...new Set(list.flatMap(order => (order.orderItems || []).map(item => item.productId)).filter(Boolean))];
      const productResults = await Promise.allSettled(ids.map(id => api.get(`/products/${id}`)));
      const productMap = {};
      productResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const product = result.value.data;
          productMap[product.id || product.productId] = product;
        }
      });
      setProductsById(productMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load orders'));
    } finally {
      setLoading(false);
    }
  };

  const trackingSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getTrackingIndex = (status = 'PENDING') => {
    const normalized = String(status).toUpperCase().replace(/\s+/g, '_');
    const index = trackingSteps.findIndex(step => step.key === normalized);
    if (normalized === 'CANCELLED') return -1;
    return index >= 0 ? index : 0;
  };

  const getEstimatedDelivery = (date) => {
    if (!date) return 'Estimated delivery: 2-5 business days';
    const placed = new Date(date);
    const min = new Date(placed);
    const max = new Date(placed);
    min.setDate(min.getDate() + 2);
    max.setDate(max.getDate() + 5);
    return `Estimated delivery: ${min.toLocaleDateString()} - ${max.toLocaleDateString()}`;
  };

  const openReason = (order, type) => {
    setReasonAction({ order, type });
    setReasonText('');
  };

  const submitReason = async () => {
    if (!reasonText.trim()) {
      alert('Please enter a reason');
      return;
    }
    setSubmittingReason(true);
    try {
      await api.patch(`/orders/${reasonAction.order.orderId}/${reasonAction.type}`, { reason: reasonText.trim() });
      setReasonAction(null);
      await loadOrders();
    } catch (err) {
      alert(getErrorMessage(err, 'Request failed'));
    } finally {
      setSubmittingReason(false);
    }
  };

  const TrackingTimeline = ({ order }) => {
    const activeIndex = getTrackingIndex(order.status);
    const cancelled = String(order.status || '').toUpperCase() === 'CANCELLED';

    if (cancelled) {
      return (
        <div className="border-t bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
          This order has been cancelled.
          {order.cancelReason && <p className="mt-1 text-xs font-semibold">Reason: {order.cancelReason}</p>}
        </div>
      );
    }

    return (
      <div className="border-t bg-[#161616] px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white/90">
          <FiTruck className="text-orange-600" /> Order Tracking
          <span className="ml-auto hidden text-xs font-semibold text-white/50 sm:block">{getEstimatedDelivery(order.orderDate)}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {trackingSteps.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <div key={step.key} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-[#161616] text-gray-400'}`}>
                  {done ? <FiCheckCircle size={16} /> : <FiClock size={15} />}
                </div>
                <div>
                  <p className={`text-sm font-black ${done ? 'text-white' : 'text-gray-400'}`}>{step.label}</p>
                  <p className="text-xs text-white/50">{done ? 'Completed' : 'Pending'}</p>
                </div>
                {index < trackingSteps.length - 1 && <div className={`hidden h-1 w-full rounded-full sm:block ${index < activeIndex ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-white/50 sm:hidden">{getEstimatedDelivery(order.orderDate)}</p>
        {(order.customerLatitude || order.trackingLatitude) && (
          <div className="mt-3 rounded-sm bg-green-50 p-3 text-xs text-green-800">
            <FiMapPin className="mr-1 inline" /> Live tracking: {order.trackingLatitude || order.customerLatitude}, {order.trackingLongitude || order.customerLongitude}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-5">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="mb-4 rounded-md bg-[#0D0D0D] p-5 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">Account</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mt-1 text-2xl font-black">My Orders</h1>
              <p className="mt-1 text-sm text-slate-300">Track purchases, returns, and refund progress.</p>
            </div>
            <button onClick={loadOrders} className="flex items-center gap-2 self-start rounded-md border border-white/15 bg-[#161616]/10 px-4 py-2 text-sm font-bold hover:bg-[#161616]/15">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {orders.length === 0 ? (
          <div className="rounded-md border bg-[#161616] p-10 text-center shadow-sm">
            <FiShoppingBag size={52} className="mx-auto mb-3 text-orange-600" />
            <h2 className="text-xl font-black text-white">No orders yet</h2>
            <p className="mt-2 text-white/50">Your placed orders will appear here.</p>
            <Link to="/" className="mt-5 inline-block rounded-md bg-[#0D0D0D] px-6 py-3 font-bold text-white">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <section key={order.orderId} className="overflow-hidden rounded-md border bg-[#161616] shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-[#161616] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-white">Order #{order.orderId}</p>
                    <p className="text-xs text-white/50">{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Date unavailable'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-orange-50 px-3 py-1 font-bold text-orange-700">{order.status || 'PENDING'}</span>
                    <span className="font-black text-white">Rs {Number(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="divide-y">
                  {(order.orderItems || []).map(item => {
                    const product = productsById[item.productId] || {};
                    const image = product.images?.[0] || product.imageUrl || IMG_FALLBACK;
                    return (
                      <Link key={item.orderItemId || `${order.orderId}-${item.productId}`} to={`/product/${item.productId}`} className="flex gap-4 p-4 hover:bg-orange-50/40">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border bg-[#161616]">
                          <img src={image} alt={product.name || 'Product'} className="max-h-full max-w-full object-contain p-2" onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-bold text-white">{product.name || `Product #${item.productId}`}</p>
                          {product.brand && <p className="mt-1 text-xs uppercase text-white/50">{product.brand}</p>}
                          <p className="mt-2 text-sm text-white/70">Qty {item.quantity} x Rs {Number(item.priceAtPurchase || 0).toLocaleString()}</p>
                        </div>
                        <FiPackage className="mt-1 hidden shrink-0 text-orange-600 sm:block" />
                      </Link>
                    );
                  })}
                </div>
                <TrackingTimeline order={order} />
                {order.shippingAddress && <div className="border-t px-4 py-3 text-sm text-white/70"><b>Delivery:</b> {order.shippingAddress}</div>}
                {String(order.status || '').toUpperCase() === 'RETURN_REQUESTED' && (
                  <div className="border-t bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <b>Return requested:</b> {order.returnReason}
                    <p className="mt-1 text-xs font-semibold">Refund will be reviewed and credited after pickup verification.</p>
                  </div>
                )}
                {String(order.status || '').toUpperCase() === 'RETURNED' && (
                  <div className="border-t bg-green-50 px-4 py-3 text-sm text-green-700">
                    <b>Refund processing:</b> Rs {Number(order.totalAmount || 0).toLocaleString()} will be credited to the original payment method.
                  </div>
                )}
                <div className="border-t px-4 py-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {!['CANCELLED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].includes(String(order.status || '').toUpperCase()) && (
                    <button onClick={() => openReason(order, 'cancel')} className="rounded-sm border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"><FiXCircle /> Cancel with reason</button>
                  )}
                  {String(order.status || '').toUpperCase() === 'DELIVERED' && (
                    <button onClick={() => openReason(order, 'return')} className="flex items-center justify-center gap-2 rounded-md border border-orange-200 px-4 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"><FiRotateCcw /> Return with reason</button>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      {reasonAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-md bg-[#161616] p-5 shadow-xl">
            <h3 className="text-lg font-black text-white">{reasonAction.type === 'cancel' ? 'Cancel Order' : 'Return Order'} #{reasonAction.order.orderId}</h3>
            <textarea value={reasonText} onChange={e => setReasonText(e.target.value)} rows={4} className="mt-4 w-full rounded-sm border px-3 py-2 text-sm" placeholder="Write your reason here" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setReasonAction(null)} className="rounded-sm border px-4 py-2 text-sm font-bold">Close</button>
              <button onClick={submitReason} disabled={submittingReason} className="rounded-md bg-[#0D0D0D] px-4 py-2 text-sm font-black text-white disabled:bg-gray-300">{submittingReason ? 'Saving...' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;


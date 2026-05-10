import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiPackage, FiRefreshCw, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import api from '../utils/api';
import { IMG_FALLBACK } from '../utils/imgFallback';

const OrdersPage = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError(err.response?.data || 'Unable to load orders');
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

  const TrackingTimeline = ({ order }) => {
    const activeIndex = getTrackingIndex(order.status);
    const cancelled = String(order.status || '').toUpperCase() === 'CANCELLED';

    if (cancelled) {
      return (
        <div className="border-t bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
          This order has been cancelled.
        </div>
      );
    }

    return (
      <div className="border-t bg-white px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800">
          <FiTruck className="text-orange-500" /> Order Tracking
          <span className="ml-auto hidden text-xs font-semibold text-gray-500 sm:block">{getEstimatedDelivery(order.orderDate)}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {trackingSteps.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <div key={step.key} className="relative flex items-center gap-3 sm:flex-col sm:items-start">
                <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 bg-white text-gray-400'}`}>
                  {done ? <FiCheckCircle size={16} /> : <FiClock size={15} />}
                </div>
                <div>
                  <p className={`text-sm font-black ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  <p className="text-xs text-gray-500">{done ? 'Completed' : 'Pending'}</p>
                </div>
                {index < trackingSteps.length - 1 && <div className={`hidden h-1 w-full rounded-full sm:block ${index < activeIndex ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500 sm:hidden">{getEstimatedDelivery(order.orderDate)}</p>
      </div>
    );
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-5">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="mb-4 rounded-sm bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white shadow-sm">
          <p className="text-sm font-bold text-orange-100">Account</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mt-1 text-2xl font-black">My Orders</h1>
              <p className="mt-1 text-sm text-orange-50">Track your recent EcoMart purchases.</p>
            </div>
            <button onClick={loadOrders} className="self-start rounded-sm border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25 flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        {orders.length === 0 ? (
          <div className="rounded-sm border bg-white p-10 text-center shadow-sm">
            <FiShoppingBag size={52} className="mx-auto mb-3 text-orange-500" />
            <h2 className="text-xl font-black text-gray-900">No orders yet</h2>
            <p className="mt-2 text-gray-500">Your placed orders will appear here.</p>
            <Link to="/" className="mt-5 inline-block rounded-sm bg-orange-500 px-6 py-3 font-bold text-white">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <section key={order.orderId} className="overflow-hidden rounded-sm border bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-orange-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-gray-900">Order #{order.orderId}</p>
                    <p className="text-xs text-gray-500">{order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Date unavailable'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-700">{order.status || 'PENDING'}</span>
                    <span className="font-black text-gray-900">Rs {Number(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="divide-y">
                  {(order.orderItems || []).map(item => {
                    const product = productsById[item.productId] || {};
                    const image = product.images?.[0] || product.imageUrl || IMG_FALLBACK;
                    return (
                      <Link key={item.orderItemId || `${order.orderId}-${item.productId}`} to={`/product/${item.productId}`} className="flex gap-4 p-4 hover:bg-orange-50/40">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border bg-white">
                          <img src={image} alt={product.name || 'Product'} className="max-h-full max-w-full object-contain p-2" onError={e => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-bold text-gray-900">{product.name || `Product #${item.productId}`}</p>
                          {product.brand && <p className="mt-1 text-xs uppercase text-gray-500">{product.brand}</p>}
                          <p className="mt-2 text-sm text-gray-600">Qty {item.quantity} x Rs {Number(item.priceAtPurchase || 0).toLocaleString()}</p>
                        </div>
                        <FiPackage className="mt-1 hidden shrink-0 text-orange-500 sm:block" />
                      </Link>
                    );
                  })}
                </div>
                <TrackingTimeline order={order} />
                {order.shippingAddress && <div className="border-t px-4 py-3 text-sm text-gray-600"><b>Delivery:</b> {order.shippingAddress}</div>}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

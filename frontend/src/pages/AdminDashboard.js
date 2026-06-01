import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus, FiUsers, FiPackage, FiShoppingBag, FiAlertCircle, FiSearch, FiRefreshCw, FiEye, FiFilter, FiActivity, FiCreditCard } from 'react-icons/fi';
import api from '../utils/api';
import { getErrorMessage } from '../utils/errorMessage';

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8' font-family='sans-serif'%3ENo Img%3C/text%3E%3C/svg%3E";
const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const ORDER_STATUS_OPTIONS = [...ORDER_STEPS, 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];

const StatCard = ({ label, value, icon, error, active, onClick, accent }) => (
  <button type="button" onClick={onClick} className={`relative overflow-hidden bg-[#161616] rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md ${active ? 'border-orange-500 ring-2 ring-orange-100' : 'border-white/[0.08]'}`}>
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-white/50 text-xs uppercase font-black tracking-wide">{label}</p>
        <p className="text-3xl font-black text-white mt-2">{value ?? <span className="animate-pulse text-gray-400">...</span>}</p>
        {error && <p className="text-xs text-red-600 flex items-center gap-1 mt-2"><FiAlertCircle size={12} /> {error}</p>}
      </div>
      <div className="text-3xl text-orange-500 bg-[rgba(255,107,0,0.12)] p-3 rounded-xl">{icon}</div>
    </div>
  </button>
);

const Badge = ({ active }) => active
  ? <span className="text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full text-xs font-bold">Active</span>
  : <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-xs font-bold">Disabled</span>;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [stats, setStats] = useState({ users: null, orders: null, products: null, revenue: null });
  const [summaryStatusCounts, setSummaryStatusCounts] = useState({});
  const [statErrors, setStatErrors] = useState({});
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/auth/count');
      setStats(s => ({ ...s, users: typeof res.data === 'number' ? res.data : res.data?.count ?? '-' }));
      setStatErrors(s => ({ ...s, users: null }));
    } catch (e) {
      setStats(s => ({ ...s, users: '-' }));
      setStatErrors(s => ({ ...s, users: e.response?.status === 403 ? 'No permission' : 'Unavailable' }));
    }
    try {
      const res = await api.get('/orders/admin/summary');
      setStats(s => ({
        ...s,
        orders: res.data?.totalOrders ?? '-',
        revenue: Number(res.data?.totalRevenue || 0),
      }));
      setSummaryStatusCounts(res.data?.statusCounts || {});
      setStatErrors(s => ({ ...s, orders: null }));
    } catch (e) {
      setStats(s => ({ ...s, orders: '-', revenue: '-' }));
      setStatErrors(s => ({ ...s, orders: e.response?.status === 403 ? 'No permission' : 'Unavailable' }));
    }
    try {
      const res = await api.get('/products/admin/count');
      setStats(s => ({ ...s, products: res.data?.count ?? '-' }));
      setStatErrors(s => ({ ...s, products: null }));
    } catch (e) {
      setStats(s => ({ ...s, products: '-' }));
      setStatErrors(s => ({ ...s, products: e.response?.status === 403 ? 'No permission' : 'Unavailable' }));
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/auth/users');
      const list = Array.isArray(res.data) ? res.data : [];
      setUsers(list);
      setStats(s => ({ ...s, users: list.length }));
      setUsersError(null);
    } catch (e) {
      setUsers([]);
      setUsersError(e.response?.status === 403 ? 'No permission' : 'Unable to load users');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/admin/all');
      const list = Array.isArray(res.data) ? res.data : [];
      setOrders(list);
      setOrdersError(null);
    } catch (e) {
      setOrders([]);
      setOrdersError(e.response?.status === 403 ? 'No permission' : 'Unable to load orders');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/admin/all?page=0&size=200');
      const list = Array.isArray(res.data) ? res.data : res.data?.content || res.data?.products || [];
      setProducts(list);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); fetchUsers(); fetchOrders(); fetchProducts(); }, [fetchStats, fetchUsers, fetchOrders, fetchProducts]);
  const refreshAll = () => { fetchStats(); fetchUsers(); fetchOrders(); fetchProducts(); };

  const toggleUser = async (id) => {
    setTogglingUserId(id);
    try {
      const res = await api.patch(`/auth/users/${id}/toggle`);
      setUsers(prev => prev.map(user => user.userId === id ? { ...user, enabled: res.data?.enabled } : user));
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to toggle user status'));
    } finally {
      setTogglingUserId(null);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.fullName || user.email}"? This cannot be undone.`)) return;
    setDeletingUserId(user.userId);
    try {
      await api.delete(`/auth/users/${user.userId}`);
      setUsers(prev => prev.filter(row => row.userId !== user.userId));
      setStats(s => ({ ...s, users: Math.max((s.users || 1) - 1, 0) }));
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to delete user'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const toggleProduct = async (id) => {
    setTogglingId(id);
    try {
      await api.patch(`/products/${id}/toggle`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    } catch { alert('Failed to toggle product status'); }
    finally { setTogglingId(null); }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await api.delete(`/products/${product.id}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      setStats(s => ({ ...s, products: Math.max((s.products || 1) - 1, 0) }));
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to delete product'));
    } finally { setDeletingId(null); }
  };

  const updateOrderStatus = async (orderId, status) => {
    setStatusSavingId(orderId);
    try {
      const res = await api.patch(`/orders/admin/${orderId}/status`, { status });
      const updatedOrder = res.data && typeof res.data === 'object' ? res.data : null;
      setOrders(prev => prev.map(order => (
        order.orderId === orderId
          ? { ...order, ...(updatedOrder || {}), status: updatedOrder?.status || status }
          : order
      )));
      setToast(`Order #${orderId} updated to ${status.replaceAll('_', ' ')}`);
      window.setTimeout(() => setToast(''), 2400);
      fetchStats();
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to update order status'));
    } finally {
      setStatusSavingId(null);
    }
  };

  const OrderProgress = ({ status }) => {
    const activeIndex = ORDER_STEPS.indexOf(String(status || 'PENDING').toUpperCase());
    return (
      <div className="mt-2 flex min-w-[260px] items-center gap-1">
        {ORDER_STEPS.map((step, index) => {
          const done = activeIndex >= index;
          return (
            <div key={step} className="flex flex-1 items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-green-500' : 'bg-white/20'}`} title={step} />
              {index < ORDER_STEPS.length - 1 && <span className={`h-0.5 flex-1 ${activeIndex > index ? 'bg-green-500' : 'bg-white/20'}`} />}
            </div>
          );
        })}
      </div>
    );
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const statusCounts = Object.keys(summaryStatusCounts).length ? summaryStatusCounts : orders.reduce((acc, order) => {
    const key = order.status || 'PENDING';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const revenueBars = orders.slice(0, 8).map(order => Number(order.totalAmount || 0));
  const maxRevenueBar = Math.max(...revenueBars, 1);
  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? p.enabled : !p.enabled;
    return matchSearch && matchCategory && matchStatus;
  });

  if (loading) {
    return <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center"><div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      {toast && (
        <div className="fixed right-4 top-20 z-[60] rounded-md border border-white/10 bg-[#1E1E1E] px-4 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <p className="text-orange-100 text-sm font-bold uppercase tracking-wide flex items-center gap-2"><FiActivity /> Live operations</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">Admin Dashboard</h1>
            <p className="text-orange-50 mt-2">Manage users, orders and products from one place.</p>
          </div>
          <div className="flex gap-3 items-start">
            <button onClick={refreshAll} className="bg-[#161616]/15 hover:bg-[#161616]/25 border border-white/30 px-4 py-2 rounded-xl font-bold flex items-center gap-2"><FiRefreshCw /> Refresh</button>
            <button onClick={() => navigate('/add-product')} className="bg-[#161616] text-orange-600 hover:bg-[rgba(255,107,0,0.12)] px-4 py-2 rounded-xl font-black flex items-center gap-2"><FiPlus /> Add Product</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 -mt-12 mb-6">
          <StatCard label="Total Users" value={stats.users} icon={<FiUsers />} error={statErrors.users || usersError} accent="bg-orange-500" active={activePanel === 'users'} onClick={() => setActivePanel('users')} />
          <StatCard label="Total Orders" value={stats.orders} icon={<FiShoppingBag />} error={statErrors.orders || ordersError} accent="bg-amber-500" active={activePanel === 'orders'} onClick={() => setActivePanel('orders')} />
          <StatCard label="Total Products" value={stats.products} icon={<FiPackage />} error={statErrors.products} accent="bg-red-500" active={activePanel === 'products'} onClick={() => setActivePanel('products')} />
          <StatCard label="Total Revenue" value={stats.revenue === null ? null : `Rs ${Number(stats.revenue || 0).toLocaleString()}`} icon={<FiCreditCard />} error={statErrors.orders || ordersError} accent="bg-green-500" active={false} onClick={() => setActivePanel('orders')} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border bg-[#161616] p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white">Revenue Analytics</h2>
                <p className="text-sm text-white/50">Recent order value trend</p>
              </div>
              <span className="rounded-full bg-[rgba(255,107,0,0.12)] px-3 py-1 text-sm font-black text-orange-600">Rs {revenue.toLocaleString()}</span>
            </div>
            <div className="flex h-44 items-end gap-3 border-b border-l px-3 pt-4">
              {(revenueBars.length ? revenueBars : [0, 0, 0, 0]).map((amount, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-sm bg-[rgba(255,107,0,0.12)]0 transition-all" style={{ height: `${Math.max((amount / maxRevenueBar) * 130, 8)}px` }} />
                  <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-[#161616] p-5 shadow-sm">
            <h2 className="font-black text-white">Order Status</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(statusCounts).length === 0 ? <p className="text-sm text-white/50">No order data yet</p> : Object.entries(statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-bold">{status}</span><span>{count}</span></div>
                  <div className="h-2 rounded-full bg-[#0D0D0D]"><div className="h-2 rounded-full bg-[rgba(255,107,0,0.12)]0" style={{ width: `${Math.min((count / Math.max(orders.length, 1)) * 100, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activePanel === 'users' && (
          <div className="bg-[#161616] border rounded-xl shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b flex justify-between items-center"><h2 className="font-black text-white flex items-center gap-2"><FiUsers className="text-orange-500" /> Users</h2>{usersError && <span className="text-xs text-red-600">{usersError}</span>}</div>
            <table className="w-full text-sm">
              <thead className="bg-[rgba(255,107,0,0.12)] text-white/80"><tr>{['ID','Name','Email','Phone','Role','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead>
              <tbody>{users.length === 0 ? <tr><td colSpan="7" className="py-10 text-center text-white/50">No users found</td></tr> : users.map(user => <tr key={user.userId} className="border-t hover:bg-[rgba(255,107,0,0.12)]/40"><td className="px-4 py-3 font-mono text-white/50">#{user.userId}</td><td className="px-4 py-3 font-bold text-white">{user.fullName || 'Unnamed'}</td><td className="px-4 py-3 text-white/70">{user.email || '-'}</td><td className="px-4 py-3 text-white/70">{user.phoneNumber || '-'}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-[#0D0D0D] text-xs font-bold">{user.role}</span></td><td className="px-4 py-3"><Badge active={user.enabled} /></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => toggleUser(user.userId)} disabled={togglingUserId === user.userId} className="text-orange-600 hover:bg-orange-100 p-2 rounded-xl disabled:opacity-40">{togglingUserId === user.userId ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : user.enabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}</button><button onClick={() => deleteUser(user)} disabled={deletingUserId === user.userId} className="text-red-600 hover:bg-red-50 p-2 rounded-xl disabled:opacity-40">{deletingUserId === user.userId ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <FiTrash2 />}</button></div></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {activePanel === 'orders' && (
          <div className="bg-[#161616] border rounded-xl shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b flex justify-between items-center"><h2 className="font-black text-white flex items-center gap-2"><FiShoppingBag className="text-orange-500" /> Orders</h2>{ordersError && <span className="text-xs text-red-600">{ordersError}</span>}</div>
            <table className="w-full text-sm"><thead className="bg-[rgba(255,107,0,0.12)] text-white/80"><tr>{['Order ID','User ID','Amount','Items','Payment','Progress','Status Action','Date'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan="8" className="py-10 text-center text-white/50">No orders found</td></tr> : orders.map(order => <tr key={order.orderId} className="border-t hover:bg-[rgba(255,107,0,0.12)]/40"><td className="px-4 py-3 font-mono text-white/50">#{order.orderId}</td><td className="px-4 py-3">#{order.userId}</td><td className="px-4 py-3 font-black">Rs {Number(order.totalAmount || 0).toLocaleString()}</td><td className="px-4 py-3">{order.itemsCount}</td><td className="px-4 py-3">{order.paymentMethod || '-'}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">{order.status || 'PENDING'}</span><OrderProgress status={order.status} />{order.nearestWarehouse && <p className="mt-1 text-xs text-white/50">{order.nearestWarehouse} · ETA {order.estimatedDeliveryHours || '-'}h</p>}</td><td className="px-4 py-3"><select value={order.status || 'PENDING'} onChange={event => updateOrderStatus(order.orderId, event.target.value)} disabled={statusSavingId === order.orderId} className="min-w-[160px] rounded-md border border-white/10 bg-[#0D0D0D] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{ORDER_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select>{statusSavingId === order.orderId && <p className="mt-1 text-xs text-white/50">Updating...</p>}</td><td className="px-4 py-3 whitespace-nowrap text-white/70">{order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</td></tr>)}</tbody></table>
          </div>
        )}

        {activePanel === 'products' && (
          <div className="space-y-4">
            <div className="bg-[#161616] border rounded-xl shadow-sm p-3 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or brand" className="w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200" /></div>
              <div className="relative"><FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2 border rounded-xl bg-[#161616]"><option value="">All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="flex border rounded-xl overflow-hidden">{[{value:'all',label:'All'},{value:'active',label:'Active'},{value:'disabled',label:'Disabled'}].map(opt => <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-4 py-2 text-sm font-bold ${statusFilter === opt.value ? 'bg-[rgba(255,107,0,0.12)]0 text-white' : 'bg-[#161616] text-white/70 hover:bg-[rgba(255,107,0,0.12)]'}`}>{opt.label}</button>)}</div>
              <span className="text-sm text-white/50 self-center md:ml-auto">{filtered.length} / {products.length} products</span>
            </div>
            <div className="bg-[#161616] border rounded-xl shadow-sm overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[rgba(255,107,0,0.12)] text-white/80"><tr>{['Image','ID','Product','Category','Price / MRP','Stock','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-white/50">No products found</td></tr> : filtered.map(p => <tr key={p.id} className="border-t hover:bg-[rgba(255,107,0,0.12)]/40"><td className="px-4 py-3"><img src={p.images?.[0] || p.imageUrl || FALLBACK} alt={p.name} className="w-12 h-12 object-contain border rounded-xl bg-[#161616]" onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }} /></td><td className="px-4 py-3 font-mono text-white/50">#{p.id}</td><td className="px-4 py-3 max-w-[240px]"><p className="font-bold text-white truncate">{p.name}</p>{p.brand && <p className="text-xs text-orange-600 truncate">{p.brand}</p>}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-[#0D0D0D] rounded-full text-xs font-bold">{p.category || '-'}</span></td><td className="px-4 py-3"><p className="font-black">Rs {Number(p.price || 0).toLocaleString()}</p>{p.mrp > p.price && <p className="text-xs text-white/50 line-through">Rs {Number(p.mrp).toLocaleString()}</p>}</td><td className="px-4 py-3 font-bold">{p.stockQuantity === 0 ? <span className="text-red-600">Out</span> : p.stockQuantity}</td><td className="px-4 py-3"><Badge active={p.enabled} /></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => navigate(`/product/${p.id}`)} className="p-2 text-white/70 hover:bg-[#0D0D0D] rounded-xl"><FiEye /></button><button onClick={() => navigate(`/edit-product/${p.id}`)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl"><FiEdit /></button><button onClick={() => toggleProduct(p.id)} disabled={togglingId === p.id} className="p-2 text-orange-600 hover:bg-orange-100 rounded-xl disabled:opacity-40">{togglingId === p.id ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : p.enabled ? <FiToggleRight /> : <FiToggleLeft />}</button><button onClick={() => deleteProduct(p)} disabled={deletingId === p.id} className="p-2 text-red-600 hover:bg-red-50 rounded-xl disabled:opacity-40">{deletingId === p.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <FiTrash2 />}</button></div></td></tr>)}</tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;




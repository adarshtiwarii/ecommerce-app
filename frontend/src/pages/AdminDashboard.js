import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus, FiUsers, FiPackage, FiShoppingBag, FiAlertCircle, FiSearch, FiRefreshCw, FiEye, FiFilter, FiActivity } from 'react-icons/fi';
import api from '../utils/api';

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='8' font-family='sans-serif'%3ENo Img%3C/text%3E%3C/svg%3E";

const StatCard = ({ label, value, icon, error, active, onClick, accent }) => (
  <button type="button" onClick={onClick} className={`relative overflow-hidden bg-white rounded-sm border p-5 text-left shadow-sm transition hover:shadow-md ${active ? 'border-orange-500 ring-2 ring-orange-100' : 'border-gray-200'}`}>
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-gray-500 text-xs uppercase font-black tracking-wide">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-2">{value ?? <span className="animate-pulse text-gray-400">...</span>}</p>
        {error && <p className="text-xs text-red-600 flex items-center gap-1 mt-2"><FiAlertCircle size={12} /> {error}</p>}
      </div>
      <div className="text-3xl text-orange-500 bg-orange-50 p-3 rounded-sm">{icon}</div>
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
  const [stats, setStats] = useState({ users: null, orders: null, products: null });
  const [statErrors, setStatErrors] = useState({});

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
      const res = await api.get('/orders/count');
      setStats(s => ({ ...s, orders: typeof res.data === 'number' ? res.data : res.data?.count ?? '-' }));
      setStatErrors(s => ({ ...s, orders: null }));
    } catch (e) {
      setStats(s => ({ ...s, orders: '-' }));
      setStatErrors(s => ({ ...s, orders: e.response?.status === 403 ? 'No permission' : 'Unavailable' }));
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
      setStats(s => ({ ...s, orders: list.length }));
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
      setStats(s => ({ ...s, products: list.length }));
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
      alert(e.response?.data?.message || e.response?.data || 'Failed to toggle user status');
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
      alert(e.response?.data?.message || e.response?.data || 'Failed to delete user');
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
      alert(e.response?.data?.message || 'Failed to delete product');
    } finally { setDeletingId(null); }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' ? true : statusFilter === 'active' ? p.enabled : !p.enabled;
    return matchSearch && matchCategory && matchStatus;
  });

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <p className="text-orange-100 text-sm font-bold uppercase tracking-wide flex items-center gap-2"><FiActivity /> Live operations</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">Admin Dashboard</h1>
            <p className="text-orange-50 mt-2">Manage users, orders and products from one place.</p>
          </div>
          <div className="flex gap-3 items-start">
            <button onClick={refreshAll} className="bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2 rounded-sm font-bold flex items-center gap-2"><FiRefreshCw /> Refresh</button>
            <button onClick={() => navigate('/add-product')} className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-sm font-black flex items-center gap-2"><FiPlus /> Add Product</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-12 mb-6">
          <StatCard label="Total Users" value={stats.users} icon={<FiUsers />} error={statErrors.users || usersError} accent="bg-orange-500" active={activePanel === 'users'} onClick={() => setActivePanel('users')} />
          <StatCard label="Total Orders" value={stats.orders} icon={<FiShoppingBag />} error={statErrors.orders || ordersError} accent="bg-amber-500" active={activePanel === 'orders'} onClick={() => setActivePanel('orders')} />
          <StatCard label="Total Products" value={stats.products} icon={<FiPackage />} accent="bg-red-500" active={activePanel === 'products'} onClick={() => setActivePanel('products')} />
        </div>

        {activePanel === 'users' && (
          <div className="bg-white border rounded-sm shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b flex justify-between items-center"><h2 className="font-black text-gray-900 flex items-center gap-2"><FiUsers className="text-orange-500" /> Users</h2>{usersError && <span className="text-xs text-red-600">{usersError}</span>}</div>
            <table className="w-full text-sm">
              <thead className="bg-orange-50 text-gray-700"><tr>{['ID','Name','Email','Phone','Role','Status','Action'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead>
              <tbody>{users.length === 0 ? <tr><td colSpan="7" className="py-10 text-center text-gray-500">No users found</td></tr> : users.map(user => <tr key={user.userId} className="border-t hover:bg-orange-50/40"><td className="px-4 py-3 font-mono text-gray-500">#{user.userId}</td><td className="px-4 py-3 font-bold text-gray-900">{user.fullName || 'Unnamed'}</td><td className="px-4 py-3 text-gray-600">{user.email || '-'}</td><td className="px-4 py-3 text-gray-600">{user.phoneNumber || '-'}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold">{user.role}</span></td><td className="px-4 py-3"><Badge active={user.enabled} /></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => toggleUser(user.userId)} disabled={togglingUserId === user.userId} className="text-orange-600 hover:bg-orange-100 p-2 rounded-sm disabled:opacity-40">{togglingUserId === user.userId ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : user.enabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}</button><button onClick={() => deleteUser(user)} disabled={deletingUserId === user.userId} className="text-red-600 hover:bg-red-50 p-2 rounded-sm disabled:opacity-40">{deletingUserId === user.userId ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <FiTrash2 />}</button></div></td></tr>)}</tbody>
            </table>
          </div>
        )}

        {activePanel === 'orders' && (
          <div className="bg-white border rounded-sm shadow-sm overflow-x-auto">
            <div className="px-4 py-3 border-b flex justify-between items-center"><h2 className="font-black text-gray-900 flex items-center gap-2"><FiShoppingBag className="text-orange-500" /> Orders</h2>{ordersError && <span className="text-xs text-red-600">{ordersError}</span>}</div>
            <table className="w-full text-sm"><thead className="bg-orange-50 text-gray-700"><tr>{['Order ID','User ID','Amount','Items','Payment','Status','Date'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead><tbody>{orders.length === 0 ? <tr><td colSpan="7" className="py-10 text-center text-gray-500">No orders found</td></tr> : orders.map(order => <tr key={order.orderId} className="border-t hover:bg-orange-50/40"><td className="px-4 py-3 font-mono text-gray-500">#{order.orderId}</td><td className="px-4 py-3">#{order.userId}</td><td className="px-4 py-3 font-black">Rs {Number(order.totalAmount || 0).toLocaleString()}</td><td className="px-4 py-3">{order.itemsCount}</td><td className="px-4 py-3">{order.paymentMethod || '-'}</td><td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">{order.status || 'PENDING'}</span></td><td className="px-4 py-3 whitespace-nowrap text-gray-600">{order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</td></tr>)}</tbody></table>
          </div>
        )}

        {activePanel === 'products' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-sm shadow-sm p-3 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or brand" className="w-full pl-9 pr-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-200" /></div>
              <div className="relative"><FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="pl-9 pr-8 py-2 border rounded-sm bg-white"><option value="">All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="flex border rounded-sm overflow-hidden">{[{value:'all',label:'All'},{value:'active',label:'Active'},{value:'disabled',label:'Disabled'}].map(opt => <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={`px-4 py-2 text-sm font-bold ${statusFilter === opt.value ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:bg-orange-50'}`}>{opt.label}</button>)}</div>
              <span className="text-sm text-gray-500 self-center md:ml-auto">{filtered.length} / {products.length} products</span>
            </div>
            <div className="bg-white border rounded-sm shadow-sm overflow-x-auto"><table className="w-full text-sm"><thead className="bg-orange-50 text-gray-700"><tr>{['Image','ID','Product','Category','Price / MRP','Stock','Status','Actions'].map(h => <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-black">{h}</th>)}</tr></thead><tbody>{filtered.length === 0 ? <tr><td colSpan="8" className="py-12 text-center text-gray-500">No products found</td></tr> : filtered.map(p => <tr key={p.id} className="border-t hover:bg-orange-50/40"><td className="px-4 py-3"><img src={p.images?.[0] || p.imageUrl || FALLBACK} alt={p.name} className="w-12 h-12 object-contain border rounded-sm bg-white" onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }} /></td><td className="px-4 py-3 font-mono text-gray-500">#{p.id}</td><td className="px-4 py-3 max-w-[240px]"><p className="font-bold text-gray-900 truncate">{p.name}</p>{p.brand && <p className="text-xs text-orange-600 truncate">{p.brand}</p>}</td><td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-bold">{p.category || '-'}</span></td><td className="px-4 py-3"><p className="font-black">Rs {Number(p.price || 0).toLocaleString()}</p>{p.mrp > p.price && <p className="text-xs text-gray-500 line-through">Rs {Number(p.mrp).toLocaleString()}</p>}</td><td className="px-4 py-3 font-bold">{p.stockQuantity === 0 ? <span className="text-red-600">Out</span> : p.stockQuantity}</td><td className="px-4 py-3"><Badge active={p.enabled} /></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => navigate(`/product/${p.id}`)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-sm"><FiEye /></button><button onClick={() => navigate(`/edit-product/${p.id}`)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-sm"><FiEdit /></button><button onClick={() => toggleProduct(p.id)} disabled={togglingId === p.id} className="p-2 text-orange-600 hover:bg-orange-100 rounded-sm disabled:opacity-40">{togglingId === p.id ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : p.enabled ? <FiToggleRight /> : <FiToggleLeft />}</button><button onClick={() => deleteProduct(p)} disabled={deletingId === p.id} className="p-2 text-red-600 hover:bg-red-50 rounded-sm disabled:opacity-40">{deletingId === p.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <FiTrash2 />}</button></div></td></tr>)}</tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


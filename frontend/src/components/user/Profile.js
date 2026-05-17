import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBell,
  FiCheckCircle,
  FiCreditCard,
  FiHeart,
  FiHome,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiMoon,
  FiPackage,
  FiShield,
  FiShoppingBag,
  FiSmartphone,
  FiSun,
  FiTrash2,
  FiUser,
  FiEdit,
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import CloudinaryUploadWidget from '../CloudinaryUploadWidget';
import ProductCard from '../Product/ProductCard';
import api from '../../utils/api';
import { INDIA_STATES_AND_UTS } from '../../utils/indiaStates';

const tabs = [
  { id: 'overview', label: 'Overview', icon: FiUser },
  { id: 'profile', label: 'Personal info', icon: FiShield },
  { id: 'security', label: 'Security', icon: FiLock },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'orders', label: 'Orders', icon: FiPackage },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { id: 'payments', label: 'Payments', icon: FiCreditCard },
  { id: 'preferences', label: 'Preferences', icon: FiBell },
];

const emptyAddress = {
  label: 'Home',
  fullName: '',
  phoneNumber: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  defaultAddress: false,
};

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-28 rounded-lg bg-orange-100" />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="h-24 rounded-lg bg-gray-100" />
      <div className="h-24 rounded-lg bg-gray-100" />
      <div className="h-24 rounded-lg bg-gray-100" />
    </div>
  </div>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-orange-200">
    <span>
      <span className="block font-black text-gray-900">{label}</span>
      {desc && <span className="mt-1 block text-sm text-gray-500">{desc}</span>}
    </span>
    <span className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-orange-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
    </span>
  </button>
);

const Profile = () => {
  const { user, logout, updateUser, wishlist } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [orders, setOrders] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [savedPayments, setSavedPayments] = useState(() => JSON.parse(localStorage.getItem('savedPayments') || '[]'));
  const [paymentForm, setPaymentForm] = useState({ brand: 'UPI', label: '', detail: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [resetForm, setResetForm] = useState({ emailOrPhone: '', token: '', newPassword: '' });
  const [otp, setOtp] = useState({ email: '', phone: '' });
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = user?.id || Number(localStorage.getItem('userId'));

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, addressRes, ordersRes] = await Promise.allSettled([
        api.get('/profile/me'),
        api.get('/profile/addresses'),
        api.get(`/orders/my?userId=${userId}`),
      ]);
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
        setForm(profileRes.value.data);
      }
      if (addressRes.status === 'fulfilled') setAddresses(addressRes.value.data || []);
      if (ordersRes.status === 'fulfilled') setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadProfile();
    setRecentProducts(JSON.parse(localStorage.getItem('recentProducts') || '[]'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!wishlist.length) {
        setWishlistProducts([]);
        return;
      }
      const results = await Promise.allSettled(wishlist.map(id => api.get(`/products/${id}`)));
      setWishlistProducts(results.filter(r => r.status === 'fulfilled').map(r => r.value.data));
    };
    loadWishlist();
  }, [wishlist]);

  const stats = useMemo(() => [
    { label: 'Orders', value: orders.length, icon: FiShoppingBag },
    { label: 'Addresses', value: addresses.length, icon: FiHome },
    { label: 'Wishlist', value: wishlistProducts.length, icon: FiHeart },
  ], [orders.length, addresses.length, wishlistProducts.length]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        profileImageUrl: form.profileImageUrl,
        darkMode: form.darkMode,
        marketingNotifications: form.marketingNotifications,
        orderNotifications: form.orderNotifications,
        profilePrivate: form.profilePrivate,
      };
      const res = await api.put('/profile/me', payload);
      const nextProfile = res.data.user || res.data;
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setProfile(nextProfile);
      setForm(nextProfile);
      updateUser({ name: nextProfile.fullName, email: nextProfile.email, id: nextProfile.userId, role: nextProfile.role });
      showToast('Profile updated');
    } catch (err) {
      showToast(err.response?.data || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    try {
      await api.post('/profile/change-password', passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      showToast('Password changed');
    } catch (err) {
      showToast(err.response?.data || 'Password change failed');
    }
  };

  const forgotPassword = async () => {
    try {
      const res = await api.post('/profile/forgot-password', { emailOrPhone: resetForm.emailOrPhone });
      setResetForm(prev => ({ ...prev, token: res.data.devResetToken || '' }));
      showToast('Reset token generated for development');
    } catch {
      showToast('Reset request failed');
    }
  };

  const resetPassword = async () => {
    try {
      await api.post('/profile/reset-password', { token: resetForm.token, newPassword: resetForm.newPassword });
      setResetForm({ emailOrPhone: '', token: '', newPassword: '' });
      showToast('Password reset complete');
    } catch (err) {
      showToast(err.response?.data || 'Reset failed');
    }
  };

  const sendOtp = async (channel) => {
    const res = await api.post(`/profile/verification/${channel}/send`);
    setOtp(prev => ({ ...prev, [channel]: res.data.devOtp || '' }));
    showToast(`${channel === 'email' ? 'Email' : 'Mobile'} OTP generated`);
  };

  const verifyOtp = async (channel) => {
    try {
      await api.post(`/profile/verification/${channel}/verify`, { otp: otp[channel] });
      await loadProfile();
      showToast('Verification completed');
    } catch (err) {
      showToast(err.response?.data || 'OTP verification failed');
    }
  };

  const saveAddress = async () => {
    try {
      await api.post('/profile/addresses', addressForm);
      setAddressForm(emptyAddress);
      await loadProfile();
      showToast('Address saved');
    } catch (err) {
      showToast(err.response?.data || 'Address save failed');
    }
  };

  const setDefaultAddress = async (id) => {
    await api.patch(`/profile/addresses/${id}/default`);
    await loadProfile();
    showToast('Default address updated');
  };

  const deleteAddress = async (id) => {
    await api.delete(`/profile/addresses/${id}`);
    await loadProfile();
    showToast('Address deleted');
  };

  const addPayment = () => {
    if (!paymentForm.label || !paymentForm.detail) return;
    const next = [...savedPayments, { ...paymentForm, id: Date.now() }];
    setSavedPayments(next);
    localStorage.setItem('savedPayments', JSON.stringify(next));
    setPaymentForm({ brand: 'UPI', label: '', detail: '' });
    showToast('Payment method saved locally');
  };

  const logoutAll = async () => {
    try {
      await api.post('/profile/logout-all');
      logout();
      navigate('/login');
    } catch {
      showToast('Unable to logout all devices');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50 p-4">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="mb-4 text-gray-600">You are not logged in.</p>
          <button onClick={() => navigate('/login')} className="rounded-full bg-orange-500 px-6 py-3 font-black text-white">Go to Login</button>
        </div>
      </div>
    );
  }

  const panelClass = "rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:p-5";

  return (
    <div className={form.darkMode ? 'min-h-screen bg-gray-950 text-gray-100' : 'min-h-screen bg-orange-50/40 text-gray-900'}>
      {toast && <div className="fixed right-4 top-20 z-[60] rounded-lg bg-gray-950 px-4 py-3 text-sm font-bold text-white shadow-xl">{toast}</div>}
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4">
        <section className="mb-5 overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/40 bg-white">
                {form.profileImageUrl ? <img src={form.profileImageUrl} alt={form.fullName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black text-orange-500">{(form.fullName || user.name || 'U').charAt(0)}</div>}
              </div>
              <div>
                <p className="text-sm font-bold text-orange-100">Profile dashboard</p>
                <h1 className="text-2xl font-black sm:text-3xl">{form.fullName || user.name}</h1>
                <p className="mt-1 text-sm text-orange-50">{form.email || user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <CloudinaryUploadWidget multiple={false} buttonText="Change photo" onUpload={(url) => setForm(prev => ({ ...prev, profileImageUrl: url }))} />
              <button onClick={saveProfile} disabled={saving} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'}</button>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[270px_1fr]">
          <aside className="rounded-lg border border-orange-100 bg-white p-2 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-black transition ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`}>
                    <Icon /> {tab.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm font-black text-red-600 hover:bg-red-50"><FiLogOut /> Logout</button>
          </aside>

          <main className="min-w-0">
            {loading ? <Skeleton /> : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {activeTab === 'overview' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-3">
                      {stats.map(stat => {
                        const Icon = stat.icon;
                        return <div key={stat.label} className={panelClass}><Icon className="mb-3 text-orange-500" size={24} /><p className="text-3xl font-black">{stat.value}</p><p className="text-sm text-gray-500">{stat.label}</p></div>;
                      })}
                    </div>
                    <div className={panelClass}>
                      <h2 className="mb-4 text-lg font-black">Account health</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-green-700"><FiCheckCircle /> JWT protected route active</div>
                        <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-3 text-orange-700"><FiShield /> Role: {profile?.role}</div>
                        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-blue-700"><FiBell /> Email {profile?.emailVerified ? 'verified' : 'not verified'}</div>
                        <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 text-purple-700"><FiSmartphone /> Mobile {profile?.phoneVerified ? 'verified' : 'not verified'}</div>
                      </div>
                    </div>
                    <div className={panelClass}>
                      <h2 className="mb-4 text-lg font-black">Quick actions</h2>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <button onClick={() => setActiveTab('security')} className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-left font-black text-orange-700 hover:bg-orange-100">Change password</button>
                        <button onClick={() => setActiveTab('addresses')} className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-left font-black text-orange-700 hover:bg-orange-100">Add/edit address</button>
                        <button onClick={() => setActiveTab('orders')} className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-left font-black text-orange-700 hover:bg-orange-100">View old orders</button>
                        <button onClick={() => setActiveTab('wishlist')} className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-left font-black text-orange-700 hover:bg-orange-100">Manage wishlist</button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'profile' && (
                  <div className={panelClass}>
                    <h2 className="text-lg font-black">Personal information</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Full name" />
                      <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Email" />
                      <input value={form.phoneNumber || ''} onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="rounded-lg border px-3 py-3" placeholder="Mobile number" />
                      <input value={form.profileImageUrl || ''} onChange={e => setForm({ ...form, profileImageUrl: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Profile image URL" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={saveProfile} className="rounded-full bg-orange-500 px-5 py-3 font-black text-white">Save changes</button>
                      <button onClick={() => sendOtp('email')} className="rounded-full border border-orange-200 px-5 py-3 font-black text-orange-600">Send email OTP</button>
                      <button onClick={() => sendOtp('phone')} className="rounded-full border border-orange-200 px-5 py-3 font-black text-orange-600">Send mobile OTP</button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="flex gap-2"><input value={otp.email} onChange={e => setOtp({ ...otp, email: e.target.value })} className="min-w-0 flex-1 rounded-lg border px-3 py-3" placeholder="Email OTP" /><button onClick={() => verifyOtp('email')} className="rounded-lg bg-gray-900 px-4 font-black text-white">Verify</button></div>
                      <div className="flex gap-2"><input value={otp.phone} onChange={e => setOtp({ ...otp, phone: e.target.value })} className="min-w-0 flex-1 rounded-lg border px-3 py-3" placeholder="Mobile OTP" /><button onClick={() => verifyOtp('phone')} className="rounded-lg bg-gray-900 px-4 font-black text-white">Verify</button></div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className={panelClass}>
                      <h2 className="text-lg font-black">Change password</h2>
                      <div className="mt-4 space-y-3">
                        <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full rounded-lg border px-3 py-3" placeholder="Current password" />
                        <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full rounded-lg border px-3 py-3" placeholder="New password" />
                        <button onClick={changePassword} className="rounded-full bg-orange-500 px-5 py-3 font-black text-white">Update password</button>
                      </div>
                    </div>
                    <div className={panelClass}>
                      <h2 className="text-lg font-black">Forgot/reset password</h2>
                      <div className="mt-4 space-y-3">
                        <input value={resetForm.emailOrPhone} onChange={e => setResetForm({ ...resetForm, emailOrPhone: e.target.value })} className="w-full rounded-lg border px-3 py-3" placeholder="Email or mobile" />
                        <button onClick={forgotPassword} className="rounded-full border border-orange-200 px-5 py-3 font-black text-orange-600">Generate reset token</button>
                        <input value={resetForm.token} onChange={e => setResetForm({ ...resetForm, token: e.target.value })} className="w-full rounded-lg border px-3 py-3" placeholder="Reset token" />
                        <input type="password" value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} className="w-full rounded-lg border px-3 py-3" placeholder="New password" />
                        <button onClick={resetPassword} className="rounded-full bg-gray-900 px-5 py-3 font-black text-white">Reset password</button>
                      </div>
                    </div>
                    <div className={`${panelClass} lg:col-span-2`}>
                      <button onClick={logoutAll} className="rounded-full bg-red-600 px-5 py-3 font-black text-white">Logout from all devices</button>
                      <p className="mt-2 text-sm text-gray-500">This invalidates future token-version checks and logs out this browser now.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
                    <div className={panelClass}>
                      <h2 className="text-lg font-black">Add or edit address</h2>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Label" />
                        <input value={addressForm.fullName} onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Full name" />
                        <input value={addressForm.phoneNumber} onChange={e => setAddressForm({ ...addressForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="rounded-lg border px-3 py-3" placeholder="Mobile" />
                        <input value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="rounded-lg border px-3 py-3" placeholder="Pincode" />
                        <input value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="rounded-lg border px-3 py-3 sm:col-span-2" placeholder="House, street, area" />
                        <input value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Landmark" />
                        <input value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="City" />
                        <select value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="rounded-lg border px-3 py-3 sm:col-span-2"><option value="">State / UT</option>{INDIA_STATES_AND_UTS.map(s => <option key={s}>{s}</option>)}</select>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={addressForm.defaultAddress} onChange={e => setAddressForm({ ...addressForm, defaultAddress: e.target.checked })} /> Make default address</label>
                      <button onClick={saveAddress} className="mt-4 rounded-full bg-orange-500 px-5 py-3 font-black text-white">Save address</button>
                    </div>
                    <div className="space-y-3">
                      {addresses.length === 0 ? <div className={panelClass}>No saved addresses yet.</div> : addresses.map(address => (
                        <div key={address.addressId} className={panelClass}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-black">{address.label} {address.defaultAddress && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Default</span>}</p>
                              <p className="mt-1 text-sm text-gray-600">{address.fullName} - {address.phoneNumber}</p>
                              <p className="mt-1 text-sm text-gray-600">{address.line1}, {address.line2}, {address.city}, {address.state} - {address.pincode}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setAddressForm(address); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full p-2 text-orange-600 hover:bg-orange-50" title="Edit address"><FiEdit /></button>
                              <button onClick={() => deleteAddress(address.addressId)} className="rounded-full p-2 text-red-600 hover:bg-red-50" title="Delete address"><FiTrash2 /></button>
                            </div>
                          </div>
                          {!address.defaultAddress && <button onClick={() => setDefaultAddress(address.addressId)} className="mt-3 text-sm font-black text-orange-600">Set as default</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className={panelClass}>
                    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Order history and tracking</h2><Link to="/orders" className="text-sm font-black text-orange-600">Open orders page</Link></div>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => <div key={order.orderId} className="rounded-lg border bg-orange-50/40 p-3"><p className="font-black">Order #{order.orderId}</p><p className="text-sm text-gray-600">Rs {Number(order.totalAmount || 0).toLocaleString()} - {order.status || 'PENDING'} - {order.paymentStatus || 'PENDING'}</p></div>)}
                      {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className={panelClass}>
                    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Wishlist management</h2><Link to="/wishlist" className="text-sm font-black text-orange-600">View wishlist</Link></div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{wishlistProducts.slice(0, 8).map(product => <ProductCard key={product.id || product.productId} product={product} />)}</div>
                    {wishlistProducts.length === 0 && <p className="text-gray-500">Wishlist is empty.</p>}
                    {recentProducts.length > 0 && <><h3 className="mb-3 mt-6 font-black">Recently viewed</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{recentProducts.slice(0, 4).map(product => <ProductCard key={product.id || product.productId} product={product} />)}</div></>}
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className={panelClass}>
                    <h2 className="text-lg font-black">Saved payment methods</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <select value={paymentForm.brand} onChange={e => setPaymentForm({ ...paymentForm, brand: e.target.value })} className="rounded-lg border px-3 py-3"><option>UPI</option><option>Card</option><option>Net banking</option></select>
                      <input value={paymentForm.label} onChange={e => setPaymentForm({ ...paymentForm, label: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Label" />
                      <input value={paymentForm.detail} onChange={e => setPaymentForm({ ...paymentForm, detail: e.target.value })} className="rounded-lg border px-3 py-3" placeholder="Masked detail" />
                    </div>
                    <button onClick={addPayment} className="mt-3 rounded-full bg-orange-500 px-5 py-3 font-black text-white">Save method</button>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">{savedPayments.map(method => <div key={method.id} className="rounded-lg border bg-gray-50 p-4"><p className="font-black">{method.brand} - {method.label}</p><p className="text-sm text-gray-500">{method.detail}</p></div>)}</div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div className="space-y-3">
                    <Toggle checked={!!form.darkMode} onChange={(value) => setForm({ ...form, darkMode: value })} label={form.darkMode ? 'Dark mode' : 'Light mode'} desc="Choose your profile appearance." />
                    <Toggle checked={!!form.orderNotifications} onChange={(value) => setForm({ ...form, orderNotifications: value })} label="Order notifications" desc="Receive order and delivery updates." />
                    <Toggle checked={!!form.marketingNotifications} onChange={(value) => setForm({ ...form, marketingNotifications: value })} label="Offer notifications" desc="Receive deals and product recommendations." />
                    <Toggle checked={!!form.profilePrivate} onChange={(value) => setForm({ ...form, profilePrivate: value })} label="Private profile" desc="Limit visibility of profile metadata." />
                    <button onClick={saveProfile} className="rounded-full bg-orange-500 px-5 py-3 font-black text-white">{form.darkMode ? <FiMoon className="mr-2 inline" /> : <FiSun className="mr-2 inline" />} Save preferences</button>
                  </div>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;

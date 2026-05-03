import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus } from 'react-icons/fi';
import api from '../utils/api';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/products/admin/all?page=0&size=100');

      // ✅ Backend response structure check — content array ya direct array dono handle
      const data = res.data;
      if (data.content) {
        setProducts(data.content);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Unexpected response format:', data);
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
      // ✅ 403 error — token issue
      if (err.response?.status === 403) {
        setError('Access denied. Admin token required. Please login again.');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found: /products/admin/all');
      } else {
        setError(`Error: ${err.response?.data || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleProduct = async (id) => {
    try {
      await api.patch(`/products/${id}/toggle`);
      fetchProducts();
    } catch (err) {
      console.error('Toggle failed', err);
      alert('Failed to toggle product: ' + (err.response?.data || err.message));
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete product');
    }
  };

  // ✅ productName aur name dono handle karo
  const filtered = products.filter(p =>
    (p.productName || p.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ─── Loading ───
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen text-cinematic-text">
      Loading admin dashboard...
    </div>
  );

  // ─── Error ───
  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <p className="text-red-400 text-lg">{error}</p>
      <button
        onClick={fetchProducts}
        className="bg-cinematic-accent text-white px-6 py-2 rounded-lg"
      >
        Retry
      </button>
      <button
        onClick={() => navigate('/login')}
        className="text-blue-400 underline"
      >
        Re-login
      </button>
    </div>
  );

  return (
    <div className="bg-cinematic-dark min-h-screen p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cinematic-text">
            Admin Dashboard
            {/* ✅ Count show karo */}
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({products.length} products)
            </span>
          </h1>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-cinematic-accent hover:opacity-90 text-white px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <FiPlus /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-cinematic-card border border-cinematic-border text-cinematic-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {search ? 'No products match your search.' : 'No products found. Add your first product!'}
          </div>
        )}

        {/* Table */}
        {filtered.length > 0 && (
          <div className="overflow-x-auto bg-cinematic-card rounded-lg shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 border-b border-cinematic-border">
                <tr>
                  {/* ✅ productId column */}
                  <th className="px-4 py-3 text-left text-cinematic-text">ID</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Image</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Name</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Price</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Stock</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Enabled</th>
                  <th className="px-4 py-3 text-left text-cinematic-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  // ✅ key me productId use karo
                  <tr
                    key={p.productId || p.id}
                    className="border-b border-cinematic-border hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3 text-cinematic-text-muted text-xs">
                      {p.productId || p.id}
                    </td>

                    {/* ✅ Image column add kiya — product pehchanna easy hoga */}
                    <td className="px-4 py-3">
                      <img
                        src={p.imageUrl || 'https://via.placeholder.com/50'}
                        alt={p.productName || p.name}
                        className="w-10 h-10 object-contain bg-gray-800 rounded"
                      />
                    </td>

                    {/* ✅ productName || name — dono fallback */}
                    <td className="px-4 py-3 text-cinematic-text max-w-xs">
                      <span className="line-clamp-2">{p.productName || p.name}</span>
                    </td>

                    <td className="px-4 py-3 text-cinematic-text">₹{p.price}</td>
                    <td className="px-4 py-3 text-cinematic-text">{p.stockQuantity}</td>
                    <td className="px-4 py-3">{p.enabled ? '✅' : '❌'}</td>

                    <td className="px-4 py-3 space-x-3">
                      <button
                        onClick={() => navigate(`/edit-product/${p.productId || p.id}`)}
                        className="text-blue-400 hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.productId || p.id)}
                        className="text-red-400 hover:text-red-300 transition"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        onClick={() => toggleProduct(p.productId || p.id)}
                        className="text-cinematic-accent"
                        title={p.enabled ? 'Disable' : 'Enable'}
                      >
                        {p.enabled
                          ? <FiToggleRight size={20} />
                          : <FiToggleLeft size={20} />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
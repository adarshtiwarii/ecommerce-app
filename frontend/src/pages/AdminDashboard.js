import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiPlus } from 'react-icons/fi';
import api from '../utils/api';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/admin/all?page=0&size=100');
      setProducts(res.data.content);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleProduct = async (id) => {
    await api.patch(`/products/${id}/toggle`);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center items-center min-h-screen text-cinematic-text">Loading admin dashboard...</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cinematic-text">Admin Dashboard</h1>
          <button onClick={() => navigate('/add-product')} className="bg-cinematic-accent hover:opacity-90 text-white px-4 py-2 rounded flex items-center gap-2 transition">
            <FiPlus /> Add Product
          </button>
        </div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-cinematic-card border border-cinematic-border text-cinematic-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinematic-accent"
          />
        </div>
        <div className="overflow-x-auto bg-cinematic-card rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-cinematic-border">
              <tr>
                <th className="px-4 py-3 text-left text-cinematic-text">ID</th>
                <th className="px-4 py-3 text-left text-cinematic-text">Name</th>
                <th className="px-4 py-3 text-left text-cinematic-text">Price</th>
                <th className="px-4 py-3 text-left text-cinematic-text">Stock</th>
                <th className="px-4 py-3 text-left text-cinematic-text">Enabled</th>
                <th className="px-4 py-3 text-left text-cinematic-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-cinematic-border hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3 text-cinematic-text">{p.id}</td>
                  <td className="px-4 py-3 text-cinematic-text">{p.name}</td>
                  <td className="px-4 py-3 text-cinematic-text">₹{p.price}</td>
                  <td className="px-4 py-3 text-cinematic-text">{p.stockQuantity}</td>
                  <td className="px-4 py-3 text-cinematic-text">{p.enabled ? '✅' : '❌'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-blue-400 hover:text-blue-300 transition">
                      <FiEdit />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-300 transition">
                      <FiTrash2 />
                    </button>
                    <button onClick={() => toggleProduct(p.id)} className="text-cinematic-accent">
                      {p.enabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
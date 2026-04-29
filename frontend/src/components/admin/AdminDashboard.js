import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from '../../utils/auth';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/products/admin/all?page=0&size=100', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(data.content || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleProduct = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/products/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
      fetchProducts();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-center py-10 text-white">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <button onClick={() => navigate('/add-product')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
          <FaPlus /> Add Product
        </button>
      </div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search product"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded w-full max-w-md text-white bg-forest-surface/50"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-neon-green/30 text-white">
          <thead className="bg-forest-surface/50">
            <tr>
              <th className="p-2">ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-neon-green/20">
                <td className="p-2">{p.id}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.enabled ? '✅' : '❌'}</td>
                <td className="space-x-2">
                  <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-blue-400"><FaEdit /></button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-400"><FaTrash /></button>
                  <button onClick={() => toggleProduct(p.id)}>
                    {p.enabled ? <FaToggleOff className="text-gray-400" /> : <FaToggleOn className="text-neon-green" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
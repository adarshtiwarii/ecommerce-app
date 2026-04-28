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
    const res = await fetch('http://localhost:8080/api/products/admin/all?page=0&size=100', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    setProducts(data.content);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleProduct = async (id) => {
    await fetch(`http://localhost:8080/api/products/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    fetchProducts();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => navigate('/add-product')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
          <FaPlus /> Add Product
        </button>
      </div>
      <div className="mb-6">
        <input type="text" placeholder="Search product" value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded w-full max-w-md" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100">…
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.id}</td>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.stockQuantity}</td>
                <td>{p.enabled ? 'Yes' : 'No'}</td>
                <td className="space-x-2">
                  <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-blue-600"><FaEdit /></button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-600"><FaTrash /></button>
                  <button onClick={() => toggleProduct(p.id)}>{p.enabled ? <FaToggleOff /> : <FaToggleOn />}</button>
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
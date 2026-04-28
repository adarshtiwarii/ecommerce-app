import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getUserId } from '../../utils/auth';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sellerId = getUserId();

  useEffect(() => {
    const fetch = async () => {
      const res = await fetch(`http://localhost:8080/api/products/my?sellerId=${sellerId}&page=0&size=100`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setProducts(data.content);
      setLoading(false);
    };
    fetch();
  }, [sellerId]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete?')) return;
    await fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading your products...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>
      <button onClick={() => navigate('/add-product')} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">Add Product</button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded shadow">
            <img src={p.imageUrl || '/placeholder.png'} alt={p.name} className="h-40 object-contain" />
            <h3 className="font-bold mt-2">{p.name}</h3>
            <p>₹{p.price}</p>
            <div className="flex justify-between mt-2">
              <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-blue-600"><FaEdit /></button>
              <button onClick={() => deleteProduct(p.id)} className="text-red-600"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;
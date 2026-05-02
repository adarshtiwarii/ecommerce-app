import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../utils/api';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sellerId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await api.get(`/products/my?sellerId=${sellerId}&page=0&size=100`);
        setProducts(res.data.content);
      } catch (err) {
        console.error('Failed to fetch seller products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, [sellerId]);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading your products...</div>;

  return (
    <div className="bg-fk-light min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <button onClick={() => navigate('/add-product')} className="bg-fk-blue text-white px-4 py-2 rounded flex items-center gap-2">
            <FiPlus /> Add Product
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded shadow p-4">
              <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt={p.name} className="w-full h-32 object-contain" />
              <h3 className="font-medium mt-2">{p.name}</h3>
              <p className="text-fk-blue font-bold">₹{p.price}</p>
              <div className="flex justify-between mt-2">
                <button onClick={() => navigate(`/edit-product/${p.id}`)} className="text-blue-600"><FiEdit /></button>
                <button onClick={() => deleteProduct(p.id)} className="text-red-600"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
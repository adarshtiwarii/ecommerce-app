import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/auth';

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const sellerId = localStorage.getItem('userId') || 1; // fallback

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
      sellerId: sellerId,
    };

    try {
      const res = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Product added successfully!');
        navigate('/admin');
      } else {
        const msg = await res.text();
        setError(msg || 'Failed to add product');
      }
    } catch (err) {
      setError('Server error. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-2xl p-6 md:p-8 rounded-2xl">
        <h2 className="text-2xl font-light text-white mb-6">Add New Product</h2>
        {error && <div className="bg-red-900/40 text-red-400 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            rows="3"
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL"
            onChange={handleChange}
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
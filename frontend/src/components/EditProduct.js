import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { getAuthHeaders } from '../utils/auth';

const EditProduct = () => {
  const { id } = useParams();
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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price,
          stockQuantity: data.stockQuantity,
          imageUrl: data.imageUrl || '',
          category: data.category || '',
        });
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
    };
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Product updated successfully!');
        navigate('/admin');
      } else {
        const msg = await res.text();
        setError(msg || 'Update failed');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center py-10 text-white">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-2xl p-6 md:p-8 rounded-2xl">
        <h2 className="text-2xl font-light text-white mb-6">Edit Product</h2>
        {error && <div className="bg-red-900/40 text-red-400 p-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            value={form.stockQuantity}
            onChange={handleChange}
            required
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-xl px-4 py-2 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green font-semibold py-2 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
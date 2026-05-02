import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

const AddProduct = () => {
  const { user } = useApp();
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
      sellerId: user?.id || localStorage.getItem('userId'),
    };
    try {
      await api.post('/products', payload);
      alert('Product added successfully');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cinematic-dark min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-cinematic-card rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-cinematic-text mb-6">Add New Product</h1>
          {error && <div className="bg-red-900/30 border border-red-500 text-red-300 p-2 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Product Name" onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400" />
            <textarea name="description" placeholder="Description" rows="3" onChange={handleChange} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white placeholder-gray-400" />
            <input type="number" step="0.01" name="price" placeholder="Price" onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="number" name="stockQuantity" placeholder="Stock Quantity" onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="text" name="imageUrl" placeholder="Image URL" onChange={handleChange} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="text" name="category" placeholder="Category (Electronics, Fashion, Appliances, Home)" onChange={handleChange} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <button type="submit" disabled={loading} className="w-full bg-cinematic-accent hover:opacity-90 text-white font-semibold py-2 rounded-lg transition">
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
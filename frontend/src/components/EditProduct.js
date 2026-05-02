import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

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
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          price: p.price,
          stockQuantity: p.stockQuantity,
          imageUrl: p.imageUrl || '',
          category: p.category || '',
        });
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
    };
    try {
      await api.put(`/products/${id}`, payload);
      alert('Product updated successfully');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center py-10 text-cinematic-text">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-400">{error}</div>;

  return (
    <div className="bg-cinematic-dark min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-cinematic-card rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-cinematic-text mb-6">Edit Product</h1>
          {error && <div className="bg-red-900/30 border border-red-500 text-red-300 p-2 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} required className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <input type="text" name="category" value={form.category} onChange={handleChange} className="w-full bg-gray-800 border border-cinematic-border rounded-lg px-4 py-2 text-white" />
            <button type="submit" disabled={loading} className="w-full bg-cinematic-accent hover:opacity-90 text-white font-semibold py-2 rounded-lg transition">
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
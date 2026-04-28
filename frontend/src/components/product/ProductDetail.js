import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    alert('Added to cart');
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="w-full md:w-1/2 object-contain" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-600 mt-2">{product.description}</p>
            <div className="mt-4">
              <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
              <span className="line-through text-gray-400 ml-2">₹{Math.round(product.price * 1.2)}</span>
              <span className="text-green-600 ml-2">20% off</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
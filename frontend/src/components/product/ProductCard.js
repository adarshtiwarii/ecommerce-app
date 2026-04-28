import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const discount = 20; // placeholder – could be real from backend
  const originalPrice = product.price * (1 + discount / 100);

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition">
        <div className="relative p-4">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/200'}
            alt={product.name}
            className="w-full h-48 object-contain transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              4.3 <FaStar className="w-3 h-3" />
            </span>
            <span className="text-gray-500 text-xs">(1,234)</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-gray-900">₹{product.price}</span>
            <span className="text-gray-500 line-through text-sm">₹{Math.round(originalPrice)}</span>
            <span className="text-green-600 text-sm font-medium">{discount}% off</span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Free delivery</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
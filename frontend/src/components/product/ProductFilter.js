import React, { useState } from 'react';

const ProductFilter = ({ onFilter }) => {
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const filters = {
      category: category || null,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    };
    onFilter(filters);
  };

  const categories = ['Electronics', 'Fashion', 'Home', 'Footwear', 'Accessories'];

  return (
    <div className="bg-forest-surface/40 rounded-xl p-4 border border-neon-green/20">
      <h3 className="text-white font-semibold mb-3">Filter Products</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-lg px-3 py-2 text-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-lg px-3 py-2 text-white"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full bg-forest-surface/50 border border-neon-green/30 rounded-lg px-3 py-2 text-white"
        />
        <button type="submit" className="w-full bg-neon-green/20 hover:bg-neon-green/40 text-neon-green py-2 rounded-lg transition">
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default ProductFilter;
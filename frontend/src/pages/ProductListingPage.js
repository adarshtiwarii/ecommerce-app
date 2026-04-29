// frontend/src/pages/ProductListingPage.js
import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/product/ProductGrid';

const ProductListingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/products?page=${page}&size=${pageSize}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light text-white">All Products</h1>
        <p className="text-sm text-gray-400">{totalElements} products found</p>
      </div>

      <ProductGrid products={products} loading={loading} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-forest-surface/50 border border-neon-green/30 rounded-lg text-white disabled:opacity-50 hover:bg-neon-green/10 transition"
          >
            Previous
          </button>
          <span className="text-white text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page + 1 >= totalPages}
            className="px-4 py-2 bg-forest-surface/50 border border-neon-green/30 rounded-lg text-white disabled:opacity-50 hover:bg-neon-green/10 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;
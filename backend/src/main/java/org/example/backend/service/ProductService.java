package org.example.backend.service;

import org.example.backend.model.Product;
import org.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product addProduct(Product product) {
        product.setEnabled(true);
        return productRepository.save(product);
    }

    public Page<Product> getProductsForUser(int page, int size) {
        return productRepository.findByEnabledTrue(PageRequest.of(page, size));
    }

    public Page<Product> getProductsForAdmin(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size));
    }

    public Page<Product> getProductsBySeller(Long sellerId, int page, int size) {
        return productRepository.findBySellerId(sellerId, PageRequest.of(page, size));
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return null;
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getPrice() != null) existing.setPrice(updated.getPrice());
        if (updated.getStockQuantity() != null) existing.setStockQuantity(updated.getStockQuantity());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        // enabled can be toggled only by admin
        if (updated.isEnabled() != existing.isEnabled()) existing.setEnabled(updated.isEnabled());
        return productRepository.save(existing);
    }

    public Page<Product> searchProducts(String keyword, int page, int size) {
        return productRepository.searchByName(keyword, PageRequest.of(page, size));
    }

    // ✅ New method: get products by category (only enabled)
    public Page<Product> getProductsByCategory(String category, int page, int size) {
        return productRepository.findByCategoryAndEnabledTrue(category, PageRequest.of(page, size));
    }
    //filter Product
    public Page<Product> filterProducts(String category, Double minPrice, Double maxPrice, int page, int size) {
        return productRepository.filterProducts(category, minPrice, maxPrice, PageRequest.of(page, size));
    }

    // Delete product by ID
    public void deleteProduct(Long id) {
        // Optional: check if product exists before deleting
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
        }
    }

}
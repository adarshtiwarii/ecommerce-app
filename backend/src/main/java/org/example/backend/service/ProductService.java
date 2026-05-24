package org.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.example.backend.model.Product;
import org.example.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private Cloudinary cloudinary;

    public Product addProduct(Product product) {
        // Set defaults for optional fields
        if (product.getMrp() == null) product.setMrp(product.getPrice());
        if (product.getRating() == null) product.setRating(0.0);
        if (product.getReviewsCount() == null) product.setReviewsCount(0);
        if (product.getImages() == null || product.getImages().isEmpty()) {
            // Fallback to single imageUrl
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                product.setImages(List.of(product.getImageUrl()));
            }
        } else if (product.getImageUrl() == null || product.getImageUrl().isEmpty()) {
            product.setImageUrl(product.getImages().get(0));
        }
        product.setEnabled(true);
        return productRepository.save(product);
    }

    public Page<Product> getProductsForUser(int page, int size) {
        return productRepository.findByEnabledTrue(PageRequest.of(page, size));
    }

    public Page<Product> getProductsForAdmin(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size));
    }

    public long getTotalProductsCount() {
        return productRepository.count();
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

        // Basic fields
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getPrice() != null) existing.setPrice(updated.getPrice());
        if (updated.getStockQuantity() != null) existing.setStockQuantity(updated.getStockQuantity());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updated.getBrand() != null) existing.setBrand(updated.getBrand());
        if (updated.getMrp() != null) existing.setMrp(updated.getMrp());
        if (updated.getRating() != null) existing.setRating(updated.getRating());
        if (updated.getReviewsCount() != null) existing.setReviewsCount(updated.getReviewsCount());
        if (updated.getInTheBox() != null) existing.setInTheBox(updated.getInTheBox());
        if (updated.getProductLatitude() != null) existing.setProductLatitude(updated.getProductLatitude());
        if (updated.getProductLongitude() != null) existing.setProductLongitude(updated.getProductLongitude());

        // Rich JSON fields
        if (updated.getImages() != null) {
            existing.setImages(updated.getImages());
            existing.setImageUrl(updated.getImages().isEmpty() ? null : updated.getImages().get(0));
        }
        if (updated.getSpecifications() != null) existing.setSpecifications(updated.getSpecifications());
        if (updated.getHighlights() != null) existing.setHighlights(updated.getHighlights());
        if (updated.getWarranty() != null) existing.setWarranty(updated.getWarranty());
        if (updated.getManufacturer() != null) existing.setManufacturer(updated.getManufacturer());

        return productRepository.save(existing);
    }

    public Product setProductEnabled(Long id, boolean enabled) {
        Product existing = productRepository.findById(id).orElse(null);
        if (existing == null) return null;
        existing.setEnabled(enabled);
        return productRepository.save(existing);
    }

    public Page<Product> searchProducts(String keyword, int page, int size) {
        return productRepository.searchByName(keyword, PageRequest.of(page, size));
    }

    public Page<Product> getProductsByCategory(String category, int page, int size) {
        return productRepository.findByCategoryAndEnabledTrue(category, PageRequest.of(page, size));
    }

    public Page<Product> filterProducts(String category, Double minPrice, Double maxPrice, int page, int size) {
        return productRepository.filterProducts(category, minPrice, maxPrice, PageRequest.of(page, size));
    }

    /**
     * Delete product by ID and also delete the associated image from Cloudinary if it exists.
     */
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null && product.getImageUrl() != null && product.getImageUrl().contains("cloudinary.com")) {
            try {
                String publicId = extractPublicIdFromUrl(product.getImageUrl());
                if (publicId != null) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    logger.info("Deleted image from Cloudinary: {}", publicId);
                }
            } catch (Exception e) {
                logger.warn("Failed to delete image from Cloudinary for product {}: {}", id, e.getMessage());
            }
        }
        // Also delete any images stored in the `images` array (Cloudinary)
        if (product != null && product.getImages() != null) {
            for (String imgUrl : product.getImages()) {
                if (imgUrl.contains("cloudinary.com")) {
                    try {
                        String publicId = extractPublicIdFromUrl(imgUrl);
                        if (publicId != null) {
                            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                            logger.info("Deleted Cloudinary image: {}", publicId);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to delete image {}", imgUrl, e);
                    }
                }
            }
        }
        productRepository.deleteById(id);
    }

    /**
     * Extracts the public ID from a Cloudinary image URL.
     * Example: https://res.cloudinary.com/.../upload/v1234567890/folder/filename.jpg -> "filename"
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            String[] parts = url.split("/upload/");
            if (parts.length > 1) {
                String afterUpload = parts[1];
                // Remove version prefix like v1234567890/
                if (afterUpload.contains("/")) {
                    String[] pathParts = afterUpload.split("/");
                    String fileName = pathParts[pathParts.length - 1];
                    // Remove file extension
                    int dotIndex = fileName.lastIndexOf('.');
                    if (dotIndex != -1) {
                        return fileName.substring(0, dotIndex);
                    }
                    return fileName;
                }
                return afterUpload;
            }
        } catch (Exception e) {
            logger.warn("Failed to extract public ID from URL: {}", url, e);
        }
        return null;
    }
}

package org.example.backend.controller;

import org.example.backend.model.Product;
import org.example.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Helper to get the currently authenticated user ID from SecurityContext
    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            // Assuming your UserDetails implementation has a method getUserId()
            // If not, you can store the ID in the token and extract it via JwtUtil.
            // For simplicity, we'll return null and rely on product.sellerId from request.
            // A better approach: extract from JWT using JwtUtil.
            return null; // Placeholder – implement based on your UserDetails
        }
        return null;
    }

    // Public: get all enabled products (user view)
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getProductsForUser(page, size));
    }

    // Public: get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product p = productService.getProductById(id);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
        return ResponseEntity.ok(p);
    }

    // Public: search by keyword
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.searchProducts(keyword, page, size));
    }

    // ✅ Public: get products by category (only enabled)
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<Product>> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Product> products = productService.getProductsByCategory(category, page, size);
        return ResponseEntity.ok(products);
    }

    // Seller/Admin: add product
    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        // In a real implementation, set sellerId from authenticated user (not from frontend)
        // For now, assume frontend sends sellerId; later you can override it.
        Product saved = productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Seller/Admin: update product – only seller can update own products, admin can update any
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product existing = productService.getProductById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        // Get current user role and ID
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
        Long currentUserId = getCurrentUserId(); // You need to implement this properly
        // If role is SELLER, check ownership
        if ("ROLE_SELLER".equals(role) && !existing.getSellerId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only update your own products");
        }
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(updated);
    }

    // Admin only: toggle product enabled/disabled
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleProduct(@PathVariable Long id) {
        Product p = productService.getProductById(id);
        if (p == null) return ResponseEntity.notFound().build();
        p.setEnabled(!p.isEnabled());
        productService.updateProduct(id, p);
        return ResponseEntity.ok("Product status updated");
    }

    // Admin only: get all products (including disabled)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Product>> adminGetAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getProductsForAdmin(page, size));
    }

    // Seller: get own products
    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Page<Product>> getMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId, page, size));
    }

    // Delete product – seller can delete own, admin any
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product existing = productService.getProductById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
        Long currentUserId = getCurrentUserId(); // implement
        if ("ROLE_SELLER".equals(role) && !existing.getSellerId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own products");
        }
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
    @GetMapping("/filter")
    public ResponseEntity<Page<Product>> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<Product> products = productService.filterProducts(category, minPrice, maxPrice, page, size);
        return ResponseEntity.ok(products);
    }
}
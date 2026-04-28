package org.example.backend.repository;

import org.example.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByEnabledTrue(Pageable pageable);
    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.enabled = true")
    Page<Product> searchByName(@Param("keyword") String keyword, Pageable pageable);

    // ✅ Add category filter (case-insensitive)
    Page<Product> findByCategoryAndEnabledTrue(String category, Pageable pageable);

    // Admin view – include disabled products
    Page<Product> findAll(Pageable pageable);
}
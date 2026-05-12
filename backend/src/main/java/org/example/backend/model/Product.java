package org.example.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    // Basic fields (existing)
    private String name;
    @Column(length = 2000)
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;          // kept for backward compatibility (single image)
    private String category;
    private Long sellerId;
    private boolean enabled = true;

    // Additional basic fields (new)
    private BigDecimal mrp;             // maximum retail price
    private String brand;
    private Double rating;
    private Integer reviewsCount;

    // Rich JSON fields
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> images;        // multiple image URLs

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Map<String, String>> specifications;   // key‑value pairs

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> highlights;    // bullet points

    private String inTheBox;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, String> warranty;    // {type, summary, serviceType, covered, notCovered}

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, String> manufacturer; // {name, address, contact, countryOfOrigin, marketedBy}

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private Double productLatitude;
    private Double productLongitude;

    // ----- Constructors -----
    public Product() {}

    // Convenience constructor (basic fields)
    public Product(String name, String description, BigDecimal price, Integer stockQuantity,
                   String imageUrl, String category, Long sellerId) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.category = category;
        this.sellerId = sellerId;
    }

    // ----- Getters and Setters (all fields) -----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<Map<String, String>> getSpecifications() { return specifications; }
    public void setSpecifications(List<Map<String, String>> specifications) { this.specifications = specifications; }

    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }

    public String getInTheBox() { return inTheBox; }
    public void setInTheBox(String inTheBox) { this.inTheBox = inTheBox; }

    public Map<String, String> getWarranty() { return warranty; }
    public void setWarranty(Map<String, String> warranty) { this.warranty = warranty; }

    public Map<String, String> getManufacturer() { return manufacturer; }
    public void setManufacturer(Map<String, String> manufacturer) { this.manufacturer = manufacturer; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getProductLatitude() { return productLatitude; }
    public void setProductLatitude(Double productLatitude) { this.productLatitude = productLatitude; }

    public Double getProductLongitude() { return productLongitude; }
    public void setProductLongitude(Double productLongitude) { this.productLongitude = productLongitude; }
}

package org.example.backend.dto;

public class CartItemDTO {
    private Long productId;
    private Integer quantity;
    private String name;
    private Double price;
    private String imageUrl;

    // constructors, getters, setters
    public CartItemDTO() {}
    public CartItemDTO(Long productId, Integer quantity, String name, Double price, String imageUrl) {
        this.productId = productId;
        this.quantity = quantity;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // getters and setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
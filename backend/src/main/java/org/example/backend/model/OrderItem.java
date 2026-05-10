package org.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * OrderItem Entity - T043: Order item as part of Order
 * T044: DB relationship - Many-to-One with Order and Product
 * T046: Stores price snapshot at purchase time (priceAtPurchase)
 */
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    // ✅ Option 1: Store only productId (no direct Product entity link)
    // Agar aage product details (name, image) chahiye to alag se fetch karna hoga.
    private Long productId;

    private Integer quantity;

    // ✅ T046: Price snapshot -  product ki current price nahi, jo price thi order ke time
    private BigDecimal priceAtPurchase;

    /**
     * T044: Many-to-One relationship with Order
     * Yeh field order table ki foreign key (order_id) banata hai
     */
    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    // Default constructor (JPA required)
    public OrderItem() {}

    // Constructor with fields
    public OrderItem(Long productId, Integer quantity, BigDecimal priceAtPurchase) {
        this.productId = productId;
        this.quantity = quantity;
        this.priceAtPurchase = priceAtPurchase;
    }

    // ========== Getters and Setters ==========
    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    //  Remove this method - not needed and does nothing
    // public void setOrderId(Long orderId) { }
}

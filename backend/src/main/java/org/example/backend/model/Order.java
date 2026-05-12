package org.example.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity - T043: Create Order entity
 * T044: Design DB relationships
 *
 * Yeh table 'orders' se map hoti hai database mein.
 * Har order ek user se belong karti hai (userId field se relationship).
 * Order ke multiple OrderItem hote hain (One-to-Many relationship).
 */
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;          // Primary key - auto increment

    // Yeh field User entity ki jagah simple foreign key store karta hai
    // NOTE: Agar aage relationship @ManyToOne banana chahe to User object bana sakte ho
    private Long userId;           // User ka ID (FK reference)

    private LocalDateTime orderDate = LocalDateTime.now();   // Order place karne ka date/time

    private BigDecimal totalAmount;   // T046: Total price calculated from cart items

    private String status = "PENDING";   // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

    private String shippingAddress;      // Delivery address (Checkout se aayega)

    private String paymentMethod;        // COD, CARD, UPI, etc.

    @Column(length = 1000)
    private String cancelReason;

    @Column(length = 1000)
    private String returnReason;

    private Double customerLatitude;
    private Double customerLongitude;
    private Double trackingLatitude;
    private Double trackingLongitude;

    /**
     * T044: DB relationship - One-to-Many with OrderItem
     * cascade = CascadeType.ALL: Order save/delete hone par items bhi save/delete honge
     * orphanRemoval = true: Agar item list se hata diya to DB se bhi delete ho jayega
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    // Default constructor (JPA ke liye mandatory)
    public Order() {}

    // Constructor with essential fields (optional)
    public Order(Long userId, BigDecimal totalAmount, String shippingAddress, String paymentMethod) {
        this.userId = userId;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
    }

    // ==================== Getters and Setters ====================
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }

    public String getReturnReason() { return returnReason; }
    public void setReturnReason(String returnReason) { this.returnReason = returnReason; }

    public Double getCustomerLatitude() { return customerLatitude; }
    public void setCustomerLatitude(Double customerLatitude) { this.customerLatitude = customerLatitude; }

    public Double getCustomerLongitude() { return customerLongitude; }
    public void setCustomerLongitude(Double customerLongitude) { this.customerLongitude = customerLongitude; }

    public Double getTrackingLatitude() { return trackingLatitude; }
    public void setTrackingLatitude(Double trackingLatitude) { this.trackingLatitude = trackingLatitude; }

    public Double getTrackingLongitude() { return trackingLongitude; }
    public void setTrackingLongitude(Double trackingLongitude) { this.trackingLongitude = trackingLongitude; }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    // ==================== Helper Methods ====================
    /**
     * Helper method: Order mein naya item add karne ke liye
     * Bidirectional relationship maintain karta hai
     */
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    /**
     * Helper method: Order se item remove karne ke liye
     */
    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }
}

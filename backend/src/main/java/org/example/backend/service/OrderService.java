package org.example.backend.service;

import org.example.backend.dto.PlaceOrderRequest;
import org.example.backend.dto.DeliveryEstimateResponse;
import org.example.backend.exception.BadRequestException;
import org.example.backend.model.Order;
import org.example.backend.model.OrderItem;
import org.example.backend.model.Product;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.OrderItemRepository;
import org.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderPricingService orderPricingService;

    @Autowired
    private CodRiskService codRiskService;

    @Autowired
    private DeliveryEstimateService deliveryEstimateService;

    @Autowired
    private RazorpayPaymentService razorpayPaymentService;

    @Transactional
    public Order placeOrder(PlaceOrderRequest request) {
        if (request.getUserId() == null) {
            throw new BadRequestException("User ID is required");
        }
        BigDecimal serverTotal = orderPricingService.calculateFromOrderItems(request.getItems());
        String paymentMethod = request.getPaymentMethod() == null ? "COD" : request.getPaymentMethod().trim().toUpperCase();

        if ("COD".equals(paymentMethod)) {
            codRiskService.validateCod(request.getUserId(), serverTotal, request.getShippingAddress());
        } else if (paymentMethod.startsWith("RAZORPAY") || request.getRazorpayOrderId() != null) {
            boolean verified = razorpayPaymentService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
            if (!verified) {
                throw new BadRequestException("Payment verification failed");
            }
        }

        DeliveryEstimateResponse estimate = deliveryEstimateService.estimate(
                request.getCustomerLatitude(),
                request.getCustomerLongitude()
        );

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(serverTotal);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(paymentMethod);
        boolean verifiedOnlinePayment = request.getRazorpayPaymentId() != null && request.getRazorpaySignature() != null;
        order.setPaymentStatus(verifiedOnlinePayment ? "PAID" : "PENDING");
        order.setRazorpayOrderId(request.getRazorpayOrderId());
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.setCustomerLatitude(request.getCustomerLatitude());
        order.setCustomerLongitude(request.getCustomerLongitude());
        order.setTrackingLatitude(request.getCustomerLatitude());
        order.setTrackingLongitude(request.getCustomerLongitude());
        order.setNearestWarehouse(estimate.getWarehouseName());
        order.setWarehouseDistanceKm(estimate.getDistanceKm());
        order.setEstimatedDeliveryHours(estimate.getEstimatedHours());
        order.setStatus(verifiedOnlinePayment ? "CONFIRMED" : "PENDING");
        Order savedOrder = orderRepository.save(order);

        for (PlaceOrderRequest.OrderItemRequest item : request.getItems()) {
            Product product = orderPricingService.getPurchasableProduct(item.getProductId(), item.getQuantity());
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItemRepository.save(orderItem);
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }
        return savedOrder;
    }

    // ✅ Customer ke orders
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        orders.forEach(order -> order.getOrderItems().size());
        return orders;
    }

    // ✅ Admin — sabke orders + count
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(order -> order.getOrderItems().size());
        return orders;
    }

    // ✅ Admin — total orders count
    public long getTotalOrdersCount() {
        return orderRepository.count();
    }

    @Transactional
    public Order cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        String status = order.getStatus() == null ? "" : order.getStatus().toUpperCase();
        if ("DELIVERED".equals(status) || "CANCELLED".equals(status)) {
            throw new RuntimeException("This order cannot be cancelled");
        }
        order.setStatus("CANCELLED");
        order.setCancelReason(reason);
        return orderRepository.save(order);
    }

    @Transactional
    public Order requestReturn(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Return is available only after delivery");
        }
        order.setStatus("RETURN_REQUESTED");
        order.setReturnReason(reason);
        return orderRepository.save(order);
    }
}
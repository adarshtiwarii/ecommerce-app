package org.example.backend.controller;

import org.example.backend.dto.PlaceOrderRequest;
import org.example.backend.model.Order;
import org.example.backend.repository.OrderRepository;
import org.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    // ============================================================
    // 🛒 PLACE ORDER (Customer)
    // ============================================================
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> placeOrder(@RequestBody PlaceOrderRequest request) {
        try {
            Order order = orderService.placeOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // 📋 GET MY ORDERS (Customer/User)
    // ============================================================
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Order>> getMyOrders(@RequestParam Long userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "").trim();
            if (reason.isEmpty()) return ResponseEntity.badRequest().body("Cancel reason is required");
            return ResponseEntity.ok(orderService.cancelOrder(id, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/return")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> returnOrder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "").trim();
            if (reason.isEmpty()) return ResponseEntity.badRequest().body("Return reason is required");
            return ResponseEntity.ok(orderService.requestReturn(id, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // 📊 ADMIN – GET TOTAL ORDER COUNT (for dashboard)
    // ============================================================
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getOrderCount() {
        long count = orderRepository.count();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllOrdersForAdmin() {
        List<Map<String, Object>> orders = orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getOrderDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(order -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("orderId", order.getOrderId());
                    row.put("userId", order.getUserId());
                    row.put("totalAmount", order.getTotalAmount());
                    row.put("status", order.getStatus());
                    row.put("orderDate", order.getOrderDate());
                    row.put("paymentMethod", order.getPaymentMethod());
                    row.put("paymentStatus", order.getPaymentStatus());
                    row.put("shippingAddress", order.getShippingAddress());
                    row.put("nearestWarehouse", order.getNearestWarehouse());
                    row.put("estimatedDeliveryHours", order.getEstimatedDeliveryHours());
                    row.put("itemsCount", order.getOrderItems() == null ? 0 : order.getOrderItems().size());
                    return row;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(orders);
    }
}

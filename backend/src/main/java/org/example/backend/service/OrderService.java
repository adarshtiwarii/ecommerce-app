package org.example.backend.service;

import org.example.backend.dto.PlaceOrderRequest;
import org.example.backend.model.Order;
import org.example.backend.model.OrderItem;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Transactional
    public Order placeOrder(PlaceOrderRequest request) {
        // Create and save the order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(request.getTotalAmount());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("PENDING");
        Order savedOrder = orderRepository.save(order);

        // Save each order item
        for (PlaceOrderRequest.OrderItemRequest item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(savedOrder.getOrderId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPriceAtPurchase(item.getPrice());
            orderItemRepository.save(orderItem);
        }
        return savedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
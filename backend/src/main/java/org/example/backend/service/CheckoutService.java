package org.example.backend.service;

import org.example.backend.model.*;
import org.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order checkout(Long userId, String shippingAddress, String paymentMethod) {
        // 1. Get user's cart
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot checkout empty cart");
        }

        // 2. Calculate total price (T046)
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // 3. Create Order
        Order order = new Order(userId, totalAmount, shippingAddress, paymentMethod);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        // 4. Convert CartItem -> OrderItem (price snapshot)
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).get();
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItem.setOrder(savedOrder);
            savedOrder.addOrderItem(orderItem);
        }

        Order finalOrder = orderRepository.save(savedOrder);

        // 5. Clear cart
        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();

        return finalOrder;
    }
}
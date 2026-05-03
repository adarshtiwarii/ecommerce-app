package org.example.backend.service;

import org.example.backend.dto.CartItemDTO;
import org.example.backend.model.Cart;
import org.example.backend.model.Product;
import org.example.backend.repository.CartRepository;
import org.example.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void addToCart(Long userId, Long productId, Integer quantity) {
        // check if product exists and is enabled
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.isEnabled()) {
            throw new RuntimeException("Product is not available");
        }
        // check if already in cart
        Cart existing = cartRepository.findByUserIdAndProductId(userId, productId).orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            cartRepository.save(existing);
        } else {
            Cart cartItem = new Cart(userId, productId, quantity);
            cartRepository.save(cartItem);
        }
    }

    @Transactional
    public void updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        Cart cartItem = cartRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Item not in cart"));
        if (quantity <= 0) {
            cartRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        cartRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public List<CartItemDTO> getCartItems(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        return cartItems.stream().map(cart -> {
            Product product = productRepository.findById(cart.getProductId()).orElse(null);
            if (product == null) return null;
            return new CartItemDTO(
                    product.getId(),
                    cart.getQuantity(),
                    product.getName(),
                    product.getPrice().doubleValue(),
                    product.getImageUrl()
            );
        }).filter(item -> item != null).collect(Collectors.toList());
    }

    @Transactional
    public void clearCart(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(cartItems);
    }
}
package org.example.backend.service;

import org.example.backend.dto.CartItemDTO;
import org.example.backend.model.Cart;
import org.example.backend.model.CartItem;
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

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            return newCart;
        });

        CartItem existing = findCartItem(cart, productId);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setProductId(productId);
            cartItem.setQuantity(quantity);
            cart.addItem(cartItem);
        }
        cartRepository.save(cart);
    }

    @Transactional
    public void updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        CartItem cartItem = findCartItem(cart, productId);
        if (cartItem == null) {
            throw new RuntimeException("Item not in cart");
        }

        if (quantity <= 0) {
            cart.removeItem(cartItem);
        } else {
            cartItem.setQuantity(quantity);
        }
        cartRepository.save(cart);
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        CartItem cartItem = findCartItem(cart, productId);
        if (cartItem != null) {
            cart.removeItem(cartItem);
            cartRepository.save(cart);
        }
    }

    public List<CartItemDTO> getCartItems(Long userId) {
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        if (cart == null) {
            return List.of();
        }

        return cart.getItems().stream().map(item -> {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product == null) return null;
            return new CartItemDTO(
                    product.getId(),
                    item.getQuantity(),
                    product.getName(),
                    product.getPrice().doubleValue(),
                    getPrimaryImage(product)
            );
        }).filter(item -> item != null).collect(Collectors.toList());
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    private CartItem findCartItem(Cart cart, Long productId) {
        return cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    private String getPrimaryImage(Product product) {
        if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            return product.getImageUrl();
        }
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            return product.getImages().get(0);
        }
        return null;
    }
}

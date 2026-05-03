package org.example.backend.controller;

import org.example.backend.dto.CartItemDTO;
import org.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
public class CartController {

    @Autowired
    private CartService cartService;

    // Helper to get current user ID from context (assuming UserDetails contains userId)
    // For simplicity, we'll pass userId from frontend as a query param or header
    // A better way: extract from JWT token. For now, use request parameter.

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CartItemDTO>> getCart(@RequestParam Long userId) {
        return ResponseEntity.ok(cartService.getCartItems(userId));
    }

    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addToCart(@RequestParam Long userId,
                                       @RequestParam Long productId,
                                       @RequestParam Integer quantity) {
        try {
            cartService.addToCart(userId, productId, quantity);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item added to cart");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateQuantity(@RequestParam Long userId,
                                            @RequestParam Long productId,
                                            @RequestParam Integer quantity) {
        try {
            cartService.updateCartItemQuantity(userId, productId, quantity);
            return ResponseEntity.ok("Cart updated");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFromCart(@RequestParam Long userId,
                                            @RequestParam Long productId) {
        cartService.removeFromCart(userId, productId);
        return ResponseEntity.ok("Item removed");
    }

    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> clearCart(@RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok("Cart cleared");
    }
}
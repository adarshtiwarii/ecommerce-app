package org.example.backend.controller;

import org.example.backend.model.User;
import org.example.backend.repository.CartRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminUserController {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;

    public AdminUserController(UserRepository userRepository, CartRepository cartRepository) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
    }

    // Get total count of users in system
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(userRepository.count());
    }

    // Get all users list
    // SECURITY: Password hash is automatically excluded from JSON response by @JsonIgnore annotation
    // on User.passwordHash field. No manual null setting required. This prevents sensitive password data
    // from being exposed in the API response payload.
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Password and sensitive fields automatically excluded by @JsonIgnore in User entity
        return ResponseEntity.ok(users);
    }

    // Toggle user account status (activate/deactivate)
    @PatchMapping("/users/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent admin from deactivating their own account
        if (authentication != null && authentication.getName().equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body("You cannot deactivate your own account");
        }

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", user.isEnabled() ? "User activated" : "User deactivated",
                "enabled", user.isEnabled()
        ));
    }

    // Delete user account permanently
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent admin from deleting their own account
        if (authentication != null && authentication.getName().equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body("You cannot delete your own account");
        }

        // Delete associated cart data first (referential integrity)
        cartRepository.findByUserId(id).ifPresent(cartRepository::delete);
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}
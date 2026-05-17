package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.ChangePasswordRequest;
import org.example.backend.dto.OtpVerifyRequest;
import org.example.backend.dto.ProfileUpdateRequest;
import org.example.backend.dto.ResetPasswordRequest;
import org.example.backend.config.JwtUtil;
import org.example.backend.model.User;
import org.example.backend.model.UserAddress;
import org.example.backend.service.UserAddressService;
import org.example.backend.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.time.Duration;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {
    private final UserService userService;
    private final UserAddressService userAddressService;
    private final JwtUtil jwtUtil;

    public ProfileController(UserService userService, UserAddressService userAddressService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.userAddressService = userAddressService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMe(Authentication authentication, @Valid @RequestBody ProfileUpdateRequest request) {
        try {
            User user = userService.updateProfile(authentication.getName(), request);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
            ResponseCookie cookie = ResponseCookie.from("ECOM_AUTH", token)
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(Duration.ofDays(7))
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of("user", user, "token", token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String resetToken = userService.startPasswordReset(body.getOrDefault("emailOrPhone", ""));
        return ResponseEntity.ok(Map.of(
                "message", "If the account exists, reset instructions have been generated.",
                "devResetToken", resetToken == null ? "" : resetToken
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verification/{channel}/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendOtp(Authentication authentication, @PathVariable String channel) {
        String otp = userService.issueOtp(authentication.getName(), channel);
        return ResponseEntity.ok(Map.of("message", "OTP generated", "devOtp", otp));
    }

    @PostMapping("/verification/{channel}/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> verifyOtp(Authentication authentication, @PathVariable String channel, @Valid @RequestBody OtpVerifyRequest request) {
        try {
            userService.verifyOtp(authentication.getName(), channel, request.getOtp());
            return ResponseEntity.ok(Map.of("message", "Verification completed"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addresses(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(userAddressService.list(user.getUserId()));
    }

    @PostMapping("/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> saveAddress(Authentication authentication, @RequestBody UserAddress address) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(userAddressService.save(user.getUserId(), address));
    }

    @PatchMapping("/addresses/{id}/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> defaultAddress(Authentication authentication, @PathVariable Long id) {
        User user = userService.getByEmail(authentication.getName());
        userAddressService.makeDefault(user.getUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Default address updated"));
    }

    @DeleteMapping("/addresses/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAddress(Authentication authentication, @PathVariable Long id) {
        User user = userService.getByEmail(authentication.getName());
        userAddressService.delete(user.getUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }

    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logoutAll(Authentication authentication) {
        userService.logoutAllDevices(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All sessions have been invalidated for future token-version checks"));
    }
}

package org.example.backend.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.example.backend.dto.ChangePasswordRequest;
import org.example.backend.dto.OtpVerifyRequest;
import org.example.backend.dto.ProfileUpdateRequest;
import org.example.backend.dto.ResetPasswordRequest;
import org.example.backend.config.JwtUtil;
import org.example.backend.model.User;
import org.example.backend.model.UserAddress;
import org.example.backend.service.UserAddressService;
import org.example.backend.service.UserService;
import org.example.backend.service.EmailService;
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
    private final EmailService emailService;

    public ProfileController(UserService userService, UserAddressService userAddressService, JwtUtil jwtUtil, EmailService emailService) {
        this.userService = userService;
        this.userAddressService = userAddressService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ============================================================
    // GET PROFILE — returns current authenticated user
    // SECURITY: Password and sensitive fields excluded by @JsonIgnore
    // ============================================================
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getByEmail(authentication.getName()));
    }

    // ============================================================
    // UPDATE PROFILE — updates user info and reissues JWT cookie
    // SECURITY: New token issued in HttpOnly cookie after update
    // ============================================================
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateMe(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest profileRequest,
            HttpServletRequest httpRequest) {
        try {
            User user = userService.updateProfile(authentication.getName(), profileRequest);

            // Generate new JWT token with updated user information
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());

            // Store the refreshed JWT in an HttpOnly cookie after profile changes.
            ResponseCookie cookie = ResponseCookie.from("ECOM_AUTH", token)
                    .httpOnly(true)
                    .secure(isSecureRequest(httpRequest))
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

    // ============================================================
    // CHANGE PASSWORD — requires current password to confirm identity
    // ============================================================
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

    // ============================================================
    // FORGOT PASSWORD — sends OTP to registered email
    // SECURITY: Always returns same message whether email exists or not
    //           (prevents email/phone enumeration attacks)
    // ============================================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        userService.startPasswordReset(body.get("emailOrPhone"));
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your registered email address."
        ));
    }

    // ============================================================
    // RESET PASSWORD — verifies OTP and sets new password
    // ============================================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // SEND OTP — triggers OTP for email or phone verification
    // SECURITY: OTP is sent via email/SMS only — not returned in response
    // ============================================================
    @PostMapping("/verification/{channel}/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendOtp(Authentication authentication, @PathVariable String channel) {
        userService.issueOtp(authentication.getName(), channel);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // ============================================================
    // VERIFY OTP — confirms OTP entered by user for email or phone
    // ============================================================
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

    // ============================================================
    // GET ADDRESSES — lists all saved delivery addresses
    // ============================================================
    @GetMapping("/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addresses(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(userAddressService.list(user.getUserId()));
    }

    // ============================================================
    // ADD ADDRESS — saves a new delivery address for current user
    // ============================================================
    @PostMapping("/addresses")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> saveAddress(Authentication authentication, @RequestBody UserAddress address) {
        User user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(userAddressService.save(user.getUserId(), address));
    }

    // ============================================================
    // SET DEFAULT ADDRESS — marks an address as the default
    // ============================================================
    @PatchMapping("/addresses/{id}/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> defaultAddress(Authentication authentication, @PathVariable Long id) {
        User user = userService.getByEmail(authentication.getName());
        userAddressService.makeDefault(user.getUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Default address updated"));
    }

    // ============================================================
    // DELETE ADDRESS — removes an address from user profile
    // ============================================================
    @DeleteMapping("/addresses/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteAddress(Authentication authentication, @PathVariable Long id) {
        User user = userService.getByEmail(authentication.getName());
        userAddressService.delete(user.getUserId(), id);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }

    // ============================================================
    // LOGOUT ALL DEVICES — increments token version to invalidate
    //                      all active JWTs across every device
    // ============================================================
    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> logoutAll(Authentication authentication) {
        userService.logoutAllDevices(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All sessions have been invalidated for future token-version checks"));
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}

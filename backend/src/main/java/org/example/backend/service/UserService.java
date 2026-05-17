package org.example.backend.service;

import org.example.backend.dto.RegisterRequest;
import org.example.backend.dto.ProfileUpdateRequest;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ✅ Spring ka Bean inject karo — naya object mat banao
    // SecurityConfig me @Bean hai wahi yahan aayega
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ============================================================
    // 📝 REGISTER
    // ============================================================
    public User registerUser(RegisterRequest request) {

        // ✅ Email already exist karta hai?
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        // ✅ Phone already exist karta hai?
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered!");
        }

        // ✅ Password aur confirmPassword match karte hain?
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }

        // ✅ User object banao aur save karo
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); // ✅ BCrypt hash
        user.setRole(User.Role.CUSTOMER);  // ✅ Default role CUSTOMER
        user.setGender(request.getGender());

        // ✅ DB me save karo aur return karo
        User savedUser = userRepository.save(user);

        // ✅ Response me password hash nahi aana chahiye
        savedUser.setPasswordHash(null);

        return savedUser;
    }

    // ============================================================
    // 🔐 LOGIN — Email ya Phone dono se
    // ============================================================
    public User authenticateUser(String emailOrPhone, String rawPassword) {

        // ✅ Email ya Phone — dono se user dhundo
        User user;
        if (emailOrPhone.contains("@")) {
            // Email se login
            user = userRepository.findByEmail(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("Email not registered"));
        } else {
            // Phone number se login
            user = userRepository.findByPhoneNumber(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("Phone number not registered"));
        }

        // ✅ Password match karo — BCrypt compare karega
        if (!user.isEnabled()) {
            throw new RuntimeException("Your account is deactivated. Please contact the admin.");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    public User getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPasswordHash(null);
        user.setPasswordResetTokenHash(null);
        user.setEmailOtpHash(null);
        user.setPhoneOtpHash(null);
        return user;
    }

    public User updateProfile(String currentEmail, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) user.setFullName(clean(request.getFullName()));
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(clean(request.getProfileImageUrl()));
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already registered");
            user.setEmail(clean(request.getEmail()).toLowerCase());
            user.setEmailVerified(false);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) throw new RuntimeException("Phone number already registered");
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPhoneVerified(false);
        }
        if (request.getDarkMode() != null) user.setDarkMode(request.getDarkMode());
        if (request.getMarketingNotifications() != null) user.setMarketingNotifications(request.getMarketingNotifications());
        if (request.getOrderNotifications() != null) user.setOrderNotifications(request.getOrderNotifications());
        if (request.getProfilePrivate() != null) user.setProfilePrivate(request.getProfilePrivate());

        User saved = userRepository.save(user);
        return sanitize(saved);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    public String startPasswordReset(String emailOrPhone) {
        User user = emailOrPhone.contains("@")
                ? userRepository.findByEmail(emailOrPhone).orElse(null)
                : userRepository.findByPhoneNumber(emailOrPhone).orElse(null);
        if (user == null) return null;
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        user.setPasswordResetTokenHash(sha256(token));
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(20));
        userRepository.save(user);
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetTokenHash(sha256(token))
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
        if (user.getPasswordResetExpiresAt() == null || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    public String issueOtp(String email, String channel) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String otp = String.valueOf((int) (100000 + Math.random() * 900000));
        if ("phone".equalsIgnoreCase(channel)) {
            user.setPhoneOtpHash(sha256(otp));
            user.setPhoneOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        } else {
            user.setEmailOtpHash(sha256(otp));
            user.setEmailOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        }
        userRepository.save(user);
        return otp;
    }

    public void verifyOtp(String email, String channel, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String hash = sha256(otp);
        if ("phone".equalsIgnoreCase(channel)) {
            if (!hash.equals(user.getPhoneOtpHash()) || user.getPhoneOtpExpiresAt() == null || user.getPhoneOtpExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            user.setPhoneVerified(true);
            user.setPhoneOtpHash(null);
            user.setPhoneOtpExpiresAt(null);
        } else {
            if (!hash.equals(user.getEmailOtpHash()) || user.getEmailOtpExpiresAt() == null || user.getEmailOtpExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            user.setEmailVerified(true);
            user.setEmailOtpHash(null);
            user.setEmailOtpExpiresAt(null);
        }
        userRepository.save(user);
    }

    public void logoutAllDevices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    private String clean(String value) {
        return value == null ? null : value.replaceAll("[<>]", "").trim();
    }

    private User sanitize(User user) {
        user.setPasswordHash(null);
        user.setPasswordResetTokenHash(null);
        user.setEmailOtpHash(null);
        user.setPhoneOtpHash(null);
        return user;
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed");
        }
    }
}

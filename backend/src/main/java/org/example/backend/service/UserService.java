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

@Service
public class UserService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ============================================================
    // REGISTER
    // ============================================================
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already registered!");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CUSTOMER);
        user.setGender(request.getGender());

        // @JsonIgnore handles sensitive field serialization
        return userRepository.save(user);
    }

    // ============================================================
    // LOGIN — supports both email and phone number
    // ============================================================
    public User authenticateUser(String emailOrPhone, String rawPassword) {

        User user;
        if (emailOrPhone.contains("@")) {
            user = userRepository.findByEmail(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("Email not registered"));
        } else {
            user = userRepository.findByPhoneNumber(emailOrPhone)
                    .orElseThrow(() -> new RuntimeException("Phone number not registered"));
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Your account is deactivated. Please contact the admin.");
        }

        // passwordHash is used internally only — entity is not modified
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    // ============================================================
    // GET BY EMAIL
    // ============================================================
    public User getByEmail(String email) {
        // @JsonIgnore ensures sensitive fields are not serialized in response
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ============================================================
    // UPDATE PROFILE
    // ============================================================
    public User updateProfile(String currentEmail, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) user.setFullName(clean(request.getFullName()));
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(clean(request.getProfileImageUrl()));
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail()))
                throw new RuntimeException("Email already registered");
            user.setEmail(clean(request.getEmail()).toLowerCase());
            user.setEmailVerified(false);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber()))
                throw new RuntimeException("Phone number already registered");
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPhoneVerified(false);
        }
        if (request.getDarkMode() != null) user.setDarkMode(request.getDarkMode());
        if (request.getMarketingNotifications() != null) user.setMarketingNotifications(request.getMarketingNotifications());
        if (request.getOrderNotifications() != null) user.setOrderNotifications(request.getOrderNotifications());
        if (request.getProfilePrivate() != null) user.setProfilePrivate(request.getProfilePrivate());

        // @JsonIgnore handles sensitive field serialization
        return userRepository.save(user);
    }

    // ============================================================
    // CHANGE PASSWORD
    // ============================================================
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

    // ============================================================
    // PASSWORD RESET — Step 1: Request OTP
    // ============================================================
    public String startPasswordReset(String emailOrPhone) {
        // Find user by email or phone number
        User user = emailOrPhone.contains("@")
                ? userRepository.findByEmail(emailOrPhone).orElse(null)
                : userRepository.findByPhoneNumber(emailOrPhone).orElse(null);

        // Return generic message — do not reveal if email/phone exists (prevents enumeration)
        if (user == null) return "OTP sent to your registered email address.";

        // Generate 6-digit OTP
        String otp = String.valueOf(100000 + new java.util.Random().nextInt(900000));

        // Store hashed OTP with 10-minute expiry
        user.setPasswordResetTokenHash(sha256(otp));
        user.setPasswordResetExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send OTP to user's email — do NOT return the OTP in the response
        emailService.sendPasswordResetOtp(user.getEmail(), otp);

        return "OTP sent to your registered email address.";
    }

    // ============================================================
    // PASSWORD RESET — Step 2: Verify OTP and set new password
    // ============================================================
    public void resetPassword(String token, String newPassword) {
        // Look up user by hashed OTP/token
        User user = userRepository.findByPasswordResetTokenHash(sha256(token))
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        // Check token expiry
        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Set the new password and clear the used OTP.
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);

        // Invalidate all existing sessions/JWTs
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    // ============================================================
    // OTP — Issue OTP for email or phone verification
    // ============================================================
    public String issueOtp(String email, String channel) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate 6-digit OTP
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

    // ============================================================
    // OTP — Verify OTP for email or phone
    // ============================================================
    public void verifyOtp(String email, String channel, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hash = sha256(otp);

        if ("phone".equalsIgnoreCase(channel)) {
            if (!hash.equals(user.getPhoneOtpHash())
                    || user.getPhoneOtpExpiresAt() == null
                    || user.getPhoneOtpExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            user.setPhoneVerified(true);
            user.setPhoneOtpHash(null);
            user.setPhoneOtpExpiresAt(null);
        } else {
            if (!hash.equals(user.getEmailOtpHash())
                    || user.getEmailOtpExpiresAt() == null
                    || user.getEmailOtpExpiresAt().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Invalid or expired OTP");
            }
            user.setEmailVerified(true);
            user.setEmailOtpHash(null);
            user.setEmailOtpExpiresAt(null);
        }
        userRepository.save(user);
    }

    // ============================================================
    // LOGOUT ALL DEVICES — invalidates all active JWTs
    // ============================================================
    public void logoutAllDevices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    // Strip angle brackets to prevent XSS in stored strings
    private String clean(String value) {
        return value == null ? null : value.replaceAll("[<>]", "").trim();
    }

    // SHA-256 hash used for OTPs so raw values are never stored.
    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed");
        }
    }
}

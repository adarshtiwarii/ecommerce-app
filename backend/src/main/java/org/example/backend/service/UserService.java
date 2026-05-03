package org.example.backend.service;

import org.example.backend.dto.RegisterRequest;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
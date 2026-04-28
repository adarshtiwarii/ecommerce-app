package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.config.JwtUtil;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.LoginResponse;
import org.example.backend.dto.RegisterRequest;
import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.authenticateUser(loginRequest.getEmailOrPhone(), loginRequest.getPassword());
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            LoginResponse response = new LoginResponse(
                    "Login successful",
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().toString(),
                    token
            );
            response.setUserId(user.getUserId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ✅ TEMPORARY: Create Admin account (use once, then disable)
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin() {
        if (userRepository.existsByEmail("adarsht072@gmail.com")) {
            return ResponseEntity.badRequest().body("Admin already exists!");
        }
        User admin = new User();
        admin.setFullName("Adarsh Tiwari");
        admin.setEmail("adarsht072@gmail.com");
        admin.setPhoneNumber("7007417650");
        admin.setPasswordHash(passwordEncoder.encode("Adarsh@123"));
        admin.setRole(User.Role.ADMIN);
        admin.setGender(User.Gender.MALE);
        userRepository.save(admin);
        return ResponseEntity.ok("Admin created. Email: adarsht072@gmail.com, Password: Adarsh@123");
    }

    // ✅ TEMPORARY: Create Seller account (use once, then disable)
    @PostMapping("/create-seller")
    public ResponseEntity<?> createSeller() {
        if (userRepository.existsByEmail("seller@example.com")) {
            return ResponseEntity.badRequest().body("Seller already exists!");
        }
        User seller = new User();
        seller.setFullName("Test Seller");
        seller.setEmail("seller@example.com");
        seller.setPhoneNumber("1111111111");
        seller.setPasswordHash(passwordEncoder.encode("seller123"));
        seller.setRole(User.Role.SELLER);
        seller.setGender(User.Gender.MALE);
        userRepository.save(seller);
        return ResponseEntity.ok("Seller created. Email: seller@example.com, Password: seller123");
    }

    // Exception handlers...
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body("Invalid request body: " + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + ex.getMessage());
    }
}
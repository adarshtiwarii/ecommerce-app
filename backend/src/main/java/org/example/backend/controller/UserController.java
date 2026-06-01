package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.config.JwtUtil;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.LoginResponse;
import org.example.backend.dto.RegisterRequest;
import org.example.backend.model.User;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")  // ✅ Allows frontend (React) to call this API
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ============================================================
    // 📝 REGISTER – Create a new user account
    // ============================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterRequest request,
            BindingResult bindingResult) {

        // 1. Handle validation errors (e.g., missing fields, invalid email)
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            User user = userService.registerUser(request);
            user.setPasswordHash(null); // ✅ Remove password hash from response (security)
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // 🔐 LOGIN – Authenticate user and return JWT token
    // ============================================================
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // 1. Validate credentials
            User user = userService.authenticateUser(
                    loginRequest.getEmailOrPhone(),
                    loginRequest.getPassword()
            );
            // 2. Generate JWT token (includes email and role)
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
            // 3. Build response with user details and token
            LoginResponse response = new LoginResponse(
                    "Login successful",
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().toString(),
                    token
            );
            response.setUserId(user.getUserId());  // ✅ Frontend needs userId for cart, etc.
            Duration cookieLifetime = loginRequest.isRememberMe() ? Duration.ofDays(30) : Duration.ofHours(12);
            ResponseCookie cookie = ResponseCookie.from("ECOM_AUTH", token)
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Lax")
                    .path("/")
                    .maxAge(cookieLifetime)
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // ============================================================
    // ⚠️ TEMPORARY — Create seller account (use once, then disable)
    // ============================================================
    // ============================================================
    // ❗ GLOBAL EXCEPTION HANDLERS
    // ============================================================

    // Handles validation failures from @Valid (e.g., @NotBlank, @Email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    // Handles malformed JSON (e.g., missing request body)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body("Invalid request body: " + ex.getMessage());
    }

    // Catch-all for any other unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + ex.getMessage());
    }
}

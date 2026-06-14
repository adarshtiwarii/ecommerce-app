package org.example.backend.controller;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
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
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // ============================================================
    // REGISTER - Create a new user account
    // ============================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterRequest request,
            BindingResult bindingResult) {

        // Validate input fields (e.g., missing fields, invalid email format)
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            // Password hash is automatically excluded from response by @JsonIgnore annotation on User.passwordHash field
            User user = userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // LOGIN - Authenticate user and return JWT token in secure cookie
    // ============================================================
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // Step 1: Validate user credentials (email/phone and password)
            User user = userService.authenticateUser(
                    loginRequest.getEmailOrPhone(),
                    loginRequest.getPassword()
            );

            // Step 2: Generate JWT token containing user email, role, and token version
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());

            // Step 3: Build response DTO with user information and token
            LoginResponse response = new LoginResponse(
                    "Login successful",
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().toString(),
                    token
            );
            response.setUserId(user.getUserId());

            // Step 4: Calculate cookie lifetime based on "Remember Me" checkbox
            Duration cookieLifetime = loginRequest.isRememberMe() ? Duration.ofDays(30) : Duration.ofHours(12);

            // Store the JWT in an HttpOnly cookie so browser scripts cannot read it.
            ResponseCookie cookie = ResponseCookie.from("ECOM_AUTH", token)
                    .httpOnly(true)
                    .secure(isSecureRequest(request))
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
    // GLOBAL EXCEPTION HANDLERS
    // ============================================================

    // Handles validation failures from @Valid annotations (e.g., @NotBlank, @Email, @NotNull)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    // Handles malformed JSON in request body (e.g., missing fields, wrong data types)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body("Invalid request body: " + ex.getMessage());
    }

    // Catch-all handler for any unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + ex.getMessage());
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}

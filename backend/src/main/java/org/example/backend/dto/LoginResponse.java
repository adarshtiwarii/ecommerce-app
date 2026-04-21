package org.example.backend.dto;

public class LoginResponse {
    private String message;
    private String email;
    private String fullName;
    private String role;
    private String token;

    public LoginResponse(String message, String email, String fullName, String role, String token) {
        this.message = message;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.token = token;
    }

    public String getMessage() { return message; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public String getToken() { return token; }
}
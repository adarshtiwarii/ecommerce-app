package org.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for the e‑commerce application.
 *
 * <p>Uses JWT for stateless authentication. Public endpoints (login, register,
 * public product GET) are open; all other requests require a valid JWT token.
 * Role‑based access is controlled via @PreAuthorize annotations on controllers.</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)   // enables @PreAuthorize on methods
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    // Constructor injection of the JWT filter bean
    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    // Password encoder for hashing user passwords (BCrypt is industry standard)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF because we use stateless JWT (no sessions)
                .csrf(csrf -> csrf.disable())

                // Define which endpoints are public and which require authentication
                .authorizeHttpRequests(auth -> auth
                        // 1. Authentication endpoints (login, register, etc.) – no token needed
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/create-admin",
                                "/api/auth/create-seller"
                        ).permitAll()

                        // 2. Public GET requests for products (listing, detail, search, category)
                        //    This allows users to browse products without logging in.
                        //    POST, PUT, DELETE, PATCH on /api/products require authentication.
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()

                        // 3. All other requests (including cart, orders, admin endpoints) must be authenticated
                        .anyRequest().authenticated()
                )

                // Stateless session – do not create or use JSESSIONID
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add our custom JWT filter before Spring Security's default UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

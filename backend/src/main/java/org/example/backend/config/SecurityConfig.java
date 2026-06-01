package org.example.backend.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Central Spring Security rules for the API.
 *
 * The application uses stateless JWT authentication. Login, registration,
 * password reset, public product browsing, and browser CORS preflight requests
 * are public. All other API routes require a valid JWT.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    // BCrypt keeps user passwords hashed instead of storing plain text.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Apply CORS before authorization so React requests can pass preflight.
                .cors(Customizer.withDefaults())

                // JWT authentication is stateless, so CSRF session protection is not used.
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        // Browser preflight requests do not include Authorization headers.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth and password reset endpoints must remain reachable before login.
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/profile/forgot-password",
                                "/api/profile/reset-password"
                        ).permitAll()

                        // Product browsing is public; product mutations still require auth.
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()

                        // Static frontend assets from the bundled React build must be public.
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/404.html",
                                "/asset-manifest.json",
                                "/favicon.ico",
                                "/favicon.png",
                                "/manifest.json",
                                "/robots.txt",
                                "/logo.png",
                                "/logo192.png",
                                "/logo512.png",
                                "/static/**",
                                "/product/**",
                                "/category/**",
                                "/search",
                                "/login",
                                "/register",
                                "/cart",
                                "/wishlist",
                                "/checkout",
                                "/orders",
                                "/profile",
                                "/admin",
                                "/add-product",
                                "/edit-product/**"
                        ).permitAll()

                        // Cart, orders, profile, admin, and seller APIs require authentication.
                        .anyRequest().authenticated()
                )

                // API clients should receive status codes, not default browser-login behavior.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied"))
                )

                // Do not create server sessions; every protected request carries its JWT.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authenticate JWTs before Spring Security evaluates endpoint rules.
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

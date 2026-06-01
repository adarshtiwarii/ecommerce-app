package org.example.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads JWT credentials from each protected request and populates Spring
 * Security's context before controller authorization checks run.
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Public endpoints and browser preflight requests are handled by the normal
     * security rules, so this filter does not try to parse a JWT for them.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (HttpMethod.OPTIONS.matches(method)) {
            return true;
        }

        boolean isAuthRoute = path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/profile/forgot-password") ||
                path.equals("/api/profile/reset-password");

        boolean isPublicProduct = path.startsWith("/api/products") &&
                method.equalsIgnoreCase("GET") &&
                !path.contains("/admin/");

        return isAuthRoute || isPublicProduct;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // Prefer the Authorization header, then fall back to the auth cookie.
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("ECOM_AUTH".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        if (jwt != null) {
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                logger.warn("JWT extract failed: {}", e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtUtil.validateToken(jwt, email)) {
                Integer tokenVersion = jwtUtil.extractTokenVersion(jwt);
                Integer currentTokenVersion = userRepository.findByEmail(email)
                        .map(user -> user.getTokenVersion() == null ? 0 : user.getTokenVersion())
                        .orElse(0);

                // Token versions let logout-all and password reset invalidate old tokens.
                if (!currentTokenVersion.equals(tokenVersion == null ? 0 : tokenVersion)) {
                    logger.warn("JWT token version mismatch for: {}", email);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired");
                    return;
                }

                String role = jwtUtil.extractRole(jwt);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.debug("Authenticated user: {} with role: {}", email, role);
            } else {
                logger.warn("JWT validation failed for: {}", email);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired or invalid");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}

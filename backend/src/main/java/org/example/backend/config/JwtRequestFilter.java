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
 * Intercepts every request to validate JWT token and set authentication context.
 *
 * <p>Public endpoints (e.g., /api/auth/**, public GET /api/products) are skipped.
 * All other endpoints require a valid JWT token.</p>
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
     * Determines whether the filter should be bypassed for the current request.
     *
     * @return true if the request should NOT be processed by this filter.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        boolean isAuthRoute = path.equals("/api/auth/login") ||
                path.equals("/api/auth/register") ||
                path.equals("/api/auth/create-admin") ||
                path.equals("/api/auth/create-seller") ||
                path.equals("/api/profile/forgot-password") ||
                path.equals("/api/profile/reset-password");

        // 2. Public product GET endpoints (but NOT /api/products/admin/*)
        boolean isPublicProduct = path.startsWith("/api/products") &&
                method.equalsIgnoreCase("GET") &&
                !path.contains("/admin/");   // ✅ ensures admin routes are always processed

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

        // ✅ Step 1: Extract Bearer token
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
                // ✅ Step 2: Extract email (subject) from token
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                logger.warn("JWT extract failed: {}", e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        }

        // ✅ Step 3: If we have an email and no authentication in context yet, proceed
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // ✅ Step 4: Load user details from database
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            // ✅ Step 5: Validate the token (signature + expiration)
            if (jwtUtil.validateToken(jwt, email)) {

                // ✅ Step 6: Extract raw role from token (e.g., "ADMIN", "SELLER")
                Integer tokenVersion = jwtUtil.extractTokenVersion(jwt);
                Integer currentTokenVersion = userRepository.findByEmail(email)
                        .map(user -> user.getTokenVersion() == null ? 0 : user.getTokenVersion())
                        .orElse(0);
                if (!currentTokenVersion.equals(tokenVersion == null ? 0 : tokenVersion)) {
                    logger.warn("JWT token version mismatch for: {}", email);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired");
                    return;
                }

                String role = jwtUtil.extractRole(jwt);

                // ✅ Step 7: Prepend "ROLE_" – Spring Security expects authorities like "ROLE_ADMIN"
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                // ✅ Step 8: Attach request details (IP, session, etc.)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // ✅ Step 9: Set the authentication in the SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);

                logger.debug("Authenticated user: {} with role: {}", email, role);
            } else {
                // Token expired or signature invalid
                logger.warn("JWT validation failed for: {}", email);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired or invalid");
                return;
            }
        }

        // ✅ Step 10: Continue the filter chain
        chain.doFilter(request, response);
    }
}

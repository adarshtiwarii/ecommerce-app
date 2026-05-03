package org.example.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        boolean isAuthRoute = path.startsWith("/api/auth/");

        // ✅ Public products GET — token nahi chahiye
        // ⚠️ lekin /api/products/admin/** is line se skip ho raha tha — FIX kiya
        boolean isPublicProduct = path.startsWith("/api/products") &&
                method.equals("GET") &&
                !path.contains("/admin/"); // ✅ admin routes skip NAHI honge

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

        // ✅ Step 1: Bearer token nikalo
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);

            try {
                // ✅ Step 2: Token se email extract karo
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                logger.warn("JWT extract failed: {}", e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            }
        }

        // ✅ Step 3: Email mila aur context empty hai
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // ✅ Step 4: DB se user load karo
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // ✅ Step 5: Token validate karo
            if (jwtUtil.validateToken(jwt, email)) {

                // ✅ Step 6: Token se role nikalo — "ADMIN" aayega
                String role = jwtUtil.extractRole(jwt);

                // ✅ Step 7: "ROLE_" prefix add karo — Spring Security ko "ROLE_ADMIN" chahiye
                // Pehle sirf role tha — isliye hasRole('ADMIN') match nahi hota tha
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)) // ✅ FIX
                        );

                // ✅ Step 8: Request details attach karo
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // ✅ Step 9: SecurityContext me save karo
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } else {
                logger.warn("JWT validation failed for: {}", email);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired or invalid");
                return;
            }
        }

        // ✅ Step 10: Agle filter ko pass karo
        chain.doFilter(request, response);
    }
}
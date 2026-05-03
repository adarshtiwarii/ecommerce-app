package org.example.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey SECRET_KEY;
    private final long EXPIRATION_TIME;

    public JwtUtil(
            @Value("${app.jwtSecret}") String secret,
            @Value("${app.jwtExpirationMs}") long expirationMs
    ) {
        this.SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes());
        this.EXPIRATION_TIME = expirationMs;
    }

    // ============================================================
    // 📦 TOKEN GENERATE KARNA
    // ============================================================

    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        // ✅ FIX — sirf "ADMIN" store karo, ROLE_ prefix mat lagao
        // JwtRequestFilter me "ROLE_" + role se SimpleGrantedAuthority banega
        claims.put("role", role); // ADMIN / SELLER / CUSTOMER
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    // ============================================================
    // 📖 TOKEN SE DATA NIKALNA
    // ============================================================

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ============================================================
    // ✅ TOKEN VALIDATE KARNA
    // ============================================================

    public Boolean validateToken(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return extractedEmail.equals(email) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            logger.warn("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.warn("JWT unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.warn("JWT malformed: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.warn("JWT signature invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.warn("JWT empty/null: {}", e.getMessage());
        }
        return false;
    }

    // ============================================================
    // 🕐 EXPIRY CHECK
    // ============================================================

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
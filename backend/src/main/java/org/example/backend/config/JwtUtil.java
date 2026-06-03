package org.example.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
// CHANGED: SignatureAlgorithm removed — deprecated in 0.12.x, no longer needed
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

/**
 * Utility class for JWT (JSON Web Token) operations.
 * Handles token generation, extraction of claims, and validation.
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey SECRET_KEY;
    private final long EXPIRATION_TIME;

    /**
     * Constructor – reads the secret key and expiration time from application.properties.
     * The secret must be at least 32 characters (256 bits) for HS256 algorithm.
     *
     * @param secret       JWT signing secret (from app.jwtSecret)
     * @param expirationMs token validity in milliseconds (from app.jwtExpirationMs)
     */
    public JwtUtil(
            @Value("${app.jwtSecret}") String secret,
            @Value("${app.jwtExpirationMs}") long expirationMs
    ) {
        // Convert the string secret into a SecretKey object suitable for HMAC-SHA256
        this.SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes());
        this.EXPIRATION_TIME = expirationMs;
    }

    // ============================================================
    // 📦 TOKEN GENERATION
    // ============================================================

    /**
     * Generates a JWT token for the given email and role.
     * The role is stored as a claim without the "ROLE_" prefix; the JwtRequestFilter
     * will add the prefix later to create a Spring Security authority.
     *
     * @param email user's email (subject)
     * @param role  user's role (ADMIN, SELLER, CUSTOMER)
     * @return compact JWT string
     */
    public String generateToken(String email, String role) {
        return generateToken(email, role, 0);
    }

    public String generateToken(String email, String role, Integer tokenVersion) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);   // store raw role (no "ROLE_" prefix)
        claims.put("tokenVersion", tokenVersion == null ? 0 : tokenVersion);
        return createToken(claims, email);
    }

    /**
     * Builds the actual JWT token with claims, subject, issued time, expiry, and signature.
     *
     * @param claims  additional claims (e.g., role)
     * @param subject the email address
     * @return signed JWT string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)                                                      // CHANGED: setClaims() → claims() in 0.12.x
                .subject(subject)                                                    // CHANGED: setSubject() → subject() in 0.12.x
                .issuedAt(new Date(System.currentTimeMillis()))                      // CHANGED: setIssuedAt() → issuedAt() in 0.12.x
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))  // CHANGED: setExpiration() → expiration() in 0.12.x
                .signWith(SECRET_KEY)                                                // CHANGED: signWith(key, algo) → signWith(key) in 0.12.x, algo auto-detected
                .compact();
    }

    // ============================================================
    // 📖 TOKEN CLAIM EXTRACTION
    // ============================================================

    /**
     * Extracts the email (subject) from the token.
     *
     * @param token JWT string
     * @return email address
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the role claim from the token.
     *
     * @param token JWT string
     * @return role (e.g., "ADMIN")
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Integer extractTokenVersion(String token) {
        return extractClaim(token, claims -> claims.get("tokenVersion", Integer.class));
    }

    /**
     * Extracts the expiration date from the token.
     *
     * @param token JWT string
     * @return expiration Date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract any claim using a resolver function.
     *
     * @param token          JWT string
     * @param claimsResolver function that maps Claims to desired value
     * @param <T>            type of the result
     * @return extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Parses the token and retrieves all claims.
     * Throws various exceptions if the token is invalid (handled in validateToken).
     *
     * @param token JWT string
     * @return Claims object
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()                       // CHANGED: parserBuilder() → parser() in 0.12.x
                .verifyWith(SECRET_KEY)            // CHANGED: setSigningKey() → verifyWith() in 0.12.x
                .build()
                .parseSignedClaims(token)          // CHANGED: parseClaimsJws() → parseSignedClaims() in 0.12.x
                .getPayload();                     // CHANGED: getBody() → getPayload() in 0.12.x
    }

    // ============================================================
    // ✅ TOKEN VALIDATION
    // ============================================================

    /**
     * Validates the token by checking:
     * 1. The extracted email matches the expected email.
     * 2. The token is not expired.
     * Catches all possible JWT exceptions and logs them.
     *
     * @param token JWT string
     * @param email expected user email
     * @return true if token is valid, false otherwise
     */
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

    /**
     * Checks if the token has expired.
     *
     * @param token JWT string
     * @return true if expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}
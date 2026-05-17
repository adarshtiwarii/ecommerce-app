package org.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_email", columnList = "email"),
                @Index(name = "idx_users_phone", columnList = "phoneNumber")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_phone", columnNames = "phoneNumber")
        }
)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role = Role.CUSTOMER;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private boolean enabled = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private String profileImageUrl;
    private boolean emailVerified = false;
    private boolean phoneVerified = false;
    private boolean darkMode = false;
    private boolean marketingNotifications = true;
    private boolean orderNotifications = true;
    private boolean profilePrivate = false;
    private Integer tokenVersion = 0;

    @JsonIgnore
    private String passwordResetTokenHash;

    @JsonIgnore
    private LocalDateTime passwordResetExpiresAt;

    @JsonIgnore
    private String emailOtpHash;

    @JsonIgnore
    private LocalDateTime emailOtpExpiresAt;

    @JsonIgnore
    private String phoneOtpHash;

    @JsonIgnore
    private LocalDateTime phoneOtpExpiresAt;

    public enum Role { CUSTOMER, SELLER, ADMIN }
    public enum Gender { MALE, FEMALE, OTHER }

    // Constructors
    public User() {}
    public User(String fullName, String email, String phoneNumber, String passwordHash, Role role, Gender gender) {
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
        this.role = role;
        this.gender = gender;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public boolean isMarketingNotifications() { return marketingNotifications; }
    public void setMarketingNotifications(boolean marketingNotifications) { this.marketingNotifications = marketingNotifications; }

    public boolean isOrderNotifications() { return orderNotifications; }
    public void setOrderNotifications(boolean orderNotifications) { this.orderNotifications = orderNotifications; }

    public boolean isProfilePrivate() { return profilePrivate; }
    public void setProfilePrivate(boolean profilePrivate) { this.profilePrivate = profilePrivate; }

    public Integer getTokenVersion() { return tokenVersion; }
    public void setTokenVersion(Integer tokenVersion) { this.tokenVersion = tokenVersion; }

    public String getPasswordResetTokenHash() { return passwordResetTokenHash; }
    public void setPasswordResetTokenHash(String passwordResetTokenHash) { this.passwordResetTokenHash = passwordResetTokenHash; }

    public LocalDateTime getPasswordResetExpiresAt() { return passwordResetExpiresAt; }
    public void setPasswordResetExpiresAt(LocalDateTime passwordResetExpiresAt) { this.passwordResetExpiresAt = passwordResetExpiresAt; }

    public String getEmailOtpHash() { return emailOtpHash; }
    public void setEmailOtpHash(String emailOtpHash) { this.emailOtpHash = emailOtpHash; }

    public LocalDateTime getEmailOtpExpiresAt() { return emailOtpExpiresAt; }
    public void setEmailOtpExpiresAt(LocalDateTime emailOtpExpiresAt) { this.emailOtpExpiresAt = emailOtpExpiresAt; }

    public String getPhoneOtpHash() { return phoneOtpHash; }
    public void setPhoneOtpHash(String phoneOtpHash) { this.phoneOtpHash = phoneOtpHash; }

    public LocalDateTime getPhoneOtpExpiresAt() { return phoneOtpExpiresAt; }
    public void setPhoneOtpExpiresAt(LocalDateTime phoneOtpExpiresAt) { this.phoneOtpExpiresAt = phoneOtpExpiresAt; }
}
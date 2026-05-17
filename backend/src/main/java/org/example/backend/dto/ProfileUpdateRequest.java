package org.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {
    @Size(min = 2, max = 80, message = "Name must be 2-80 characters")
    private String fullName;
    @Email(message = "Invalid email")
    private String email;
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String phoneNumber;
    private String profileImageUrl;
    private Boolean darkMode;
    private Boolean marketingNotifications;
    private Boolean orderNotifications;
    private Boolean profilePrivate;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public Boolean getDarkMode() { return darkMode; }
    public void setDarkMode(Boolean darkMode) { this.darkMode = darkMode; }
    public Boolean getMarketingNotifications() { return marketingNotifications; }
    public void setMarketingNotifications(Boolean marketingNotifications) { this.marketingNotifications = marketingNotifications; }
    public Boolean getOrderNotifications() { return orderNotifications; }
    public void setOrderNotifications(Boolean orderNotifications) { this.orderNotifications = orderNotifications; }
    public Boolean getProfilePrivate() { return profilePrivate; }
    public void setProfilePrivate(Boolean profilePrivate) { this.profilePrivate = profilePrivate; }
}

package org.example.backend.config;

import org.example.backend.model.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
public class UserBootstrapConfig {

    @Bean
    public ApplicationRunner bootstrapUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.enabled:false}") boolean adminEnabled,
            @Value("${app.bootstrap.admin.email:}") String adminEmail,
            @Value("${app.bootstrap.admin.password:}") String adminPassword,
            @Value("${app.bootstrap.admin.full-name:Admin User}") String adminFullName,
            @Value("${app.bootstrap.admin.phone:}") String adminPhone,
            @Value("${app.bootstrap.seller.enabled:false}") boolean sellerEnabled,
            @Value("${app.bootstrap.seller.email:}") String sellerEmail,
            @Value("${app.bootstrap.seller.password:}") String sellerPassword,
            @Value("${app.bootstrap.seller.full-name:Seller User}") String sellerFullName,
            @Value("${app.bootstrap.seller.phone:}") String sellerPhone
    ) {
        return args -> {
            createOrUpdateBootstrapUser(userRepository, passwordEncoder, adminEnabled,
                    adminEmail, adminPassword, adminFullName, adminPhone, User.Role.ADMIN);
            createOrUpdateBootstrapUser(userRepository, passwordEncoder, sellerEnabled,
                    sellerEmail, sellerPassword, sellerFullName, sellerPhone, User.Role.SELLER);
        };
    }

    private void createOrUpdateBootstrapUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            boolean enabled,
            String email,
            String password,
            String fullName,
            String phone,
            User.Role role
    ) {
        if (!enabled) {
            return;
        }
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password) || !StringUtils.hasText(phone)) {
            throw new IllegalStateException("Bootstrap " + role + " requires email, password, and phone");
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(User::new);
        user.setFullName(StringUtils.hasText(fullName) ? fullName.trim() : role.name() + " User");
        user.setEmail(email.trim().toLowerCase());
        user.setPhoneNumber(phone.trim());
        user.setRole(role);
        user.setGender(user.getGender() == null ? User.Gender.OTHER : user.getGender());
        user.setEnabled(true);

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        }

        userRepository.save(user);
    }
}

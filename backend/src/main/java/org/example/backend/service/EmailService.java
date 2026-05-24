package org.example.backend.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@ecomart.local}")
    private String fromAddress;

    @Value("${app.frontend.reset-url:http://localhost:3000/forgot-password}")
    private String resetUrl;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public boolean sendPasswordReset(String recipient, String token) {
        if (mailSender == null || recipient == null || !recipient.contains("@") || token == null || token.isBlank()) {
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject("EcoMart password reset");
            message.setText("""
                    Use this reset token to set a new EcoMart password:

                    %s

                    Reset page: %s

                    This token expires in 20 minutes.
                    """.formatted(token, resetUrl));
            mailSender.send(message);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }
}

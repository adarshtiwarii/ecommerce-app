package org.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Sender email from application.properties
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a password reset OTP email to the user.
     * @param toEmail  recipient email address
     * @param otp      6-digit OTP code
     */
    public void sendPasswordResetOtp(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("EcoMart - Password Reset OTP");
        message.setText(
                "Hello,\n\n" +
                        "Your password reset OTP is: " + otp + "\n\n" +
                        "This OTP is valid for 10 minutes.\n" +
                        "Do not share this OTP with anyone.\n\n" +
                        "If you did not request this, ignore this email.\n\n" +
                        "Team EcoMart"
        );

        mailSender.send(message);

        System.out.println("OTP email sent to: " + toEmail);
    }
}
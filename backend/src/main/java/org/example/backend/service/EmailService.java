package org.example.backend.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    // SendGrid API key from application.properties
    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    // Sender email — must be verified in SendGrid
    @Value("${APP_MAIL_FROM:noreply@ecomart.com}")
    private String fromEmail;

    /**
     * Sends a password reset OTP email via SendGrid HTTP API.
     * Does not use SMTP — works on Render free tier.
     */
    public void sendPasswordResetOtp(String toEmail, String otp) {

        Email from = new Email(fromEmail);
        Email to = new Email(toEmail);
        String subject = "EcoMart - Password Reset OTP";

        Content content = new Content(
                "text/plain",
                "Hello,\n\n" +
                        "Your password reset OTP is: " + otp + "\n\n" +
                        "This OTP is valid for 10 minutes.\n" +
                        "Do not share this OTP with anyone.\n\n" +
                        "If you did not request this, ignore this email.\n\n" +
                        "Team ECoMart"
        );

        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            System.out.println("SendGrid status: " + response.getStatusCode());
            System.out.println("OTP email sent to: " + toEmail);

        } catch (IOException e) {
            System.err.println("SendGrid error: " + e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
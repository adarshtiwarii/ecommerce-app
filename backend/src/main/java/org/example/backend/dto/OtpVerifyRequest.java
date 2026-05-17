package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpVerifyRequest {
    @NotBlank
    private String otp;

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}

package com.smartpark.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;
}
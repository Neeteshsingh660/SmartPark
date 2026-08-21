package com.smartpark.dto.auth;

import com.smartpark.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phone;

    @NotNull(message = "Role is required")
    private Role role;

    // ADD THIS NEW FIELD
    @NotBlank(message = "OTP is required")
    private String otp;
}
package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.auth.AuthResponse;
import com.smartpark.dto.auth.LoginRequest;
import com.smartpark.dto.auth.RegisterRequest;
import com.smartpark.dto.auth.SendOtpRequest;
import com.smartpark.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // NEW ENDPOINT TO SEND OTP
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            authService.sendRegistrationOtp(request.getEmail());
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .success(true)
                    .message("OTP sent successfully to " + request.getEmail())
                    .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // UPDATED REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(
                    ApiResponse.<AuthResponse>builder()
                            .success(true)
                            .message("User registered successfully")
                            .data(response)
                            .build()
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<AuthResponse>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Login successful")
                        .data(response)
                        .build()
        );
    }
}
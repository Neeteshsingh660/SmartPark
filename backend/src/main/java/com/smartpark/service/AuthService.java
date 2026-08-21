package com.smartpark.service;

import com.smartpark.dto.auth.AuthResponse;
import com.smartpark.dto.auth.LoginRequest;
import com.smartpark.dto.auth.RegisterRequest;
import com.smartpark.entity.User;
import com.smartpark.repository.UserRepository;
import com.smartpark.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // 1. INJECT OTP SERVICE
    private final RedisOtpService redisOtpService;

    // 2. ADD METHOD TO SEND OTP
    public void sendRegistrationOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        redisOtpService.generateAndSendOtp(email);
    }

    // 3. UPDATE REGISTER METHOD TO VERIFY OTP
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Verify OTP via Redis
        if (!redisOtpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .enabled(true)
                .build();

        userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
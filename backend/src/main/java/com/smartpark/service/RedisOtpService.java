package com.smartpark.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisOtpService {

    private final StringRedisTemplate redisTemplate;

    // INJECT THE REAL MAIL SENDER
    private final JavaMailSender mailSender;

    private static final long OTP_EXPIRATION_MINUTES = 5;

    public void generateAndSendOtp(String email) {
        // 1. Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // 2. Save in Redis with 5-minute TTL
        String redisKey = "otp:register:" + email;
        redisTemplate.opsForValue().set(redisKey, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);

        // 3. SEND THE ACTUAL EMAIL
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("SmartPark - Your Verification Code");
            message.setText("Welcome to SmartPark!\n\n" +
                    "Your verification OTP is: " + otp + "\n\n" +
                    "This OTP will expire in " + OTP_EXPIRATION_MINUTES + " minutes.\n" +
                    "Please do not share this code with anyone.");

            mailSender.send(message);
            log.info("✅ REAL Email successfully sent to: {}", email);

        } catch (Exception e) {
            log.error("❌ Failed to send email to {}", email, e);
            throw new RuntimeException("Failed to send OTP email. Please check your email address.");
        }
    }

    public boolean verifyOtp(String email, String providedOtp) {
        String redisKey = "otp:register:" + email;
        String storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (storedOtp != null && storedOtp.equals(providedOtp)) {
            // Delete OTP after successful use
            redisTemplate.delete(redisKey);
            return true;
        }
        return false;
    }
}
package com.smartpark.util;

import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class QrCodeGenerator {

    // In production, move this to application.properties!
    private static final String QR_SECRET = "SmartParkSuperSecretKey2026!";

    // Generates a secure, tamper-proof string that the frontend will render as a QR image
    public static String generateSecureQrToken(Long bookingId, String bookingReference) {
        try {
            String payload = bookingId + ":" + bookingReference + ":" + UUID.randomUUID().toString().substring(0, 8);

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(QR_SECRET.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes());
            String signature = Base64.getEncoder().encodeToString(hash);

            // Format: payload.signature (similar to a JWT)
            return Base64.getEncoder().encodeToString(payload.getBytes()) + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR code token", e);
        }
    }
}
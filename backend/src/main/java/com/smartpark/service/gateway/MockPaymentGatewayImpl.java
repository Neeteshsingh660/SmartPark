package com.smartpark.service.gateway;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;

@Service
public class MockPaymentGatewayImpl implements PaymentGateway {

    @Override
    public PaymentResult processPayment(BigDecimal amount, String currency, String paymentMethod) {
        // Simulate a 1-second network delay to external provider (Stripe/Razorpay)
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Mock logic: Fail if amount is over $1000 to test failure handling
        if (amount.compareTo(new BigDecimal("1000")) > 0) {
            return new PaymentResult(false, null, "Insufficient funds or limit exceeded");
        }

        // Success simulation
        String txId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return new PaymentResult(true, txId, null);
    }
}
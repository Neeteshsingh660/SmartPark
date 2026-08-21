package com.smartpark.service.gateway;

import java.math.BigDecimal;

public interface PaymentGateway {

    record PaymentResult(boolean success, String transactionId, String errorMessage) {}

    PaymentResult processPayment(BigDecimal amount, String currency, String paymentMethod);
}
package com.smartpark.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RazorpayVerifyRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;

    private BigDecimal walletDeducted;
    private BigDecimal payableAmount;
    private String paymentMethod;
}

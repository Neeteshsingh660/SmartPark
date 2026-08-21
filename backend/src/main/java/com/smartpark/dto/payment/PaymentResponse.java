package com.smartpark.dto.payment;

import com.smartpark.entity.PaymentMethod;
import com.smartpark.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String transactionId;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String message;
    private LocalDateTime createdAt;
}
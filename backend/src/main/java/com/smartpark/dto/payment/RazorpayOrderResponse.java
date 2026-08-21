package com.smartpark.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private BigDecimal totalAmount;
    private BigDecimal walletDeducted;
    private BigDecimal payableAmount;
    private String currency;
    private String keyId;
    private boolean fullyPaidByWallet;
    private Long bookingId;
}

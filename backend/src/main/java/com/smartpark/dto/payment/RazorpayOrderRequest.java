package com.smartpark.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RazorpayOrderRequest {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    private boolean useWallet;
}

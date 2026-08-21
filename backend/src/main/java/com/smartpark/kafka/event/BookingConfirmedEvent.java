package com.smartpark.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmedEvent {
    private Long bookingId;
    private String bookingReference;
    private Long parkingSpotId;
    private String parkingSpotTitle;
    private String driverEmail;
    private String ownerEmail;
    private BigDecimal amountPaid;
    private LocalDateTime eventTimestamp;
}

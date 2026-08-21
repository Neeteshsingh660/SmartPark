package com.smartpark.dto.parking;

import com.smartpark.entity.ParkingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ParkingSpotResponse {
    private Long id;
    private Long ownerId;
    private String title;
    private String description;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerHour;
    private ParkingStatus status;
    private Integer capacity;
    private boolean covered;
    private boolean securityAvailable;
    private boolean evChargingAvailable;
    private String imageUrl;
    private String operatingHours;
    private BigDecimal peakPricePerHour;
    private LocalDateTime createdAt;
}
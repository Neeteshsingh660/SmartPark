package com.smartpark.dto.parking;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PublicParkingSpotResponse {
    private Long id;
    private String title;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerHour;
    private Integer capacity;
    private Integer availableSpots;
    private boolean covered;
    private boolean securityAvailable;
    private boolean evChargingAvailable;
    private String imageUrl;
    private String operatingHours;
    private BigDecimal peakPricePerHour;
    private double distanceKm; // Distance from the user's search location
}
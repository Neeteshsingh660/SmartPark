package com.smartpark.dto.admin;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalDrivers;
    private long totalOwners;

    private long totalParkingSpots;
    private long activeParkingSpots;

    private long totalBookings;
    private long activeBookings;
    private long completedBookings;

    private BigDecimal totalRevenue;
}
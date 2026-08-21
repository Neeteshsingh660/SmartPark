package com.smartpark.service;

import com.smartpark.dto.admin.AdminDashboardResponse;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.ParkingStatus;
import com.smartpark.entity.Role;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSpotRepository;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final BookingRepository bookingRepository;

    public AdminDashboardResponse getDashboardAnalytics() {
        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalDrivers(userRepository.countByRole(Role.DRIVER))
                .totalOwners(userRepository.countByRole(Role.OWNER))

                .totalParkingSpots(parkingSpotRepository.count())
                .activeParkingSpots(parkingSpotRepository.countByStatus(ParkingStatus.AVAILABLE))

                .totalBookings(bookingRepository.count())
                .activeBookings(bookingRepository.countByStatus(BookingStatus.ACTIVE))
                .completedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED))

                .totalRevenue(bookingRepository.calculateTotalRevenue())
                .build();
    }
}
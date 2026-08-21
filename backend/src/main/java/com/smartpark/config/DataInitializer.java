package com.smartpark.config;

import com.smartpark.entity.*;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSpotRepository;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.smartpark.entity.ParkingStatus;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ParkingSpotRepository parkingSpotRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        // Seed Sample Owner
        User owner = User.builder()
                .name("Rajesh Kumar (Owner)")
                .email("owner@smartpark.com")
                .password(passwordEncoder.encode("password123"))
                .phone("+91 98765 43210")
                .role(Role.OWNER)
                .enabled(true)
                .build();
        userRepository.save(owner);

        // Seed Sample Driver
        User driver = User.builder()
                .name("Vikram Singh (Driver)")
                .email("driver@smartpark.com")
                .password(passwordEncoder.encode("password123"))
                .phone("+91 91234 56789")
                .role(Role.DRIVER)
                .enabled(true)
                .build();
        userRepository.save(driver);

        // Seed Sample Parking Spot with Photo, Operating Hours & Peak Pricing
        ParkingSpot spot1 = ParkingSpot.builder()
                .title("Connaught Place Premium Garage")
                .address("Block A, Inner Circle, Connaught Place")
                .city("New Delhi")
                .latitude(28.6315)
                .longitude(77.2167)
                .pricePerHour(BigDecimal.valueOf(50.0))
                .peakPricePerHour(BigDecimal.valueOf(80.0))
                .capacity(10)
                .covered(true)
                .securityAvailable(true)
                .evChargingAvailable(true)
                .operatingHours("Mon-Sun 24 Hours")
                .imageUrl("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80")
                .owner(owner)
                .status(ParkingStatus.AVAILABLE)
                .build();
        parkingSpotRepository.save(spot1);

        ParkingSpot spot2 = ParkingSpot.builder()
                .title("Bandra West Private Driveway")
                .address("Hill Road, Bandra West")
                .city("Mumbai")
                .latitude(19.0544)
                .longitude(72.8406)
                .pricePerHour(BigDecimal.valueOf(60.0))
                .peakPricePerHour(BigDecimal.valueOf(100.0))
                .capacity(4)
                .covered(false)
                .securityAvailable(true)
                .evChargingAvailable(false)
                .operatingHours("Mon-Fri 8:00 AM - 10:00 PM")
                .imageUrl("https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80")
                .owner(owner)
                .status(ParkingStatus.AVAILABLE)
                .build();
        parkingSpotRepository.save(spot2);

        // Seed Sample Booking for Driver with Vehicle details
        Booking booking = Booking.builder()
                .user(driver)
                .parkingSpot(spot1)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusHours(3))
                .amount(BigDecimal.valueOf(150.0))
                .status(BookingStatus.CONFIRMED)
                .bookingReference("BKG-SP8821")
                .qrCode("QR-SECURE-8821")
                .vehicleNumber("DL 01 AB 1234")
                .vehicleType("SUV")
                .build();
        bookingRepository.save(booking);
    }
}

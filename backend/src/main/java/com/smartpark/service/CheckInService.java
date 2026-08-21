package com.smartpark.service;

import com.smartpark.dto.booking.BookingResponse;
import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.User;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CheckInService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse checkInDriver(String qrToken, String ownerEmail) {
        Booking booking = validateQrAndGetBooking(qrToken, ownerEmail);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot check-in. Booking status is: " + booking.getStatus());
        }

        // Optional: Check if they are checking in too early (e.g., > 30 mins before start)
        if (LocalDateTime.now().isBefore(booking.getStartTime().minusMinutes(30))) {
            throw new IllegalStateException("Too early for check-in. You can check in up to 30 minutes before the start time.");
        }

        booking.setStatus(BookingStatus.ACTIVE);
        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    @Transactional
    public BookingResponse checkOutDriver(String qrToken, String ownerEmail) {
        Booking booking = validateQrAndGetBooking(qrToken, ownerEmail);

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new IllegalStateException("Cannot check-out. Driver has not checked in yet.");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    private Booking validateQrAndGetBooking(String qrToken, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        // In a real app, you would also parse the QrToken here and verify the HMAC signature
        // to ensure a hacker didn't generate a fake QR code.
        // For now, we rely on the exact string match in the DB.

        // We must query all bookings to find the matching QR code.
        // We use a stream here. For production, add findByQrCode to the Repository!
        Booking booking = bookingRepository.findAll().stream()
                .filter(b -> qrToken.equals(b.getQrCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid QR Code. No booking found."));

        // Security check: Only the OWNER of the parking spot can scan this QR code!
        if (!booking.getParkingSpot().getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("Access Denied. You do not own the parking spot for this booking.");
        }

        return booking;
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .parkingSpotId(booking.getParkingSpot().getId())
                .parkingSpotTitle(booking.getParkingSpot().getTitle())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .amount(booking.getAmount())
                .status(booking.getStatus())
                .bookingReference(booking.getBookingReference())
                .build();
    }
}
package com.smartpark.repository;

import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByParkingSpotOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.parkingSpot.id = :spotId " +
            "AND b.status IN :statuses " +
            "AND b.startTime < :newEnd AND b.endTime > :newStart")
    long countOverlappingBookings(
            @Param("spotId") Long spotId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("statuses") List<BookingStatus> statuses
    );

    List<Booking> findByParkingSpotIdAndStatusInAndEndTimeAfterOrderByStartTimeAsc(
            Long spotId, List<BookingStatus> statuses, LocalDateTime now);

    // NEW METHODS FOR ADMIN ANALYTICS
    long countByStatus(BookingStatus status);

    // Sum all money from completed/confirmed bookings. Use COALESCE to handle nulls if DB is empty.
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED')")
    BigDecimal calculateTotalRevenue();
}
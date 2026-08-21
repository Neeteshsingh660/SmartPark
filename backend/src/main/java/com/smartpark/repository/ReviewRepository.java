package com.smartpark.repository;

import com.smartpark.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByParkingSpotIdOrderByCreatedAtDesc(Long parkingSpotId);

    // Check if a review already exists for this specific booking
    boolean existsByBookingId(Long bookingId);
}
package com.smartpark.service;

import com.smartpark.dto.review.ReviewRequest;
import com.smartpark.dto.review.ReviewResponse;
import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.Review;
import com.smartpark.entity.User;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ReviewRepository;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewResponse addReview(Long bookingId, ReviewRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        Booking booking = bookingRepository.findByIdAndUserId(bookingId, driver.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found or access denied"));

        // 1. Validate Booking is COMPLETED
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("You can only review a parking spot after the booking is COMPLETED.");
        }

        // 2. Validate no duplicate reviews
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new IllegalStateException("You have already submitted a review for this booking.");
        }

        Review review = Review.builder()
                .user(driver)
                .parkingSpot(booking.getParkingSpot())
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsForParking(Long parkingSpotId) {
        return reviewRepository.findByParkingSpotIdOrderByCreatedAtDesc(parkingSpotId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .parkingSpotId(review.getParkingSpot().getId())
                .bookingId(review.getBooking().getId())
                .driverName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
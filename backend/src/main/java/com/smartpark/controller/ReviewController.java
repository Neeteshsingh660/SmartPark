package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.review.ReviewRequest;
import com.smartpark.dto.review.ReviewResponse;
import com.smartpark.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Anyone who made a booking can leave a review
    @PostMapping("/booking/{bookingId}")
    @PreAuthorize("hasAnyRole('DRIVER', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long bookingId,
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {

        try {
            ReviewResponse response = reviewService.addReview(bookingId, request, principal.getName());
            return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                    .success(true)
                    .message("Review submitted successfully!")
                    .data(response)
                    .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<ReviewResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    // Public endpoint: Anyone can see the reviews for a parking spot
    @GetMapping("/parking/{parkingSpotId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getParkingReviews(
            @PathVariable Long parkingSpotId) {

        List<ReviewResponse> responses = reviewService.getReviewsForParking(parkingSpotId);
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .success(true)
                .message("Fetched " + responses.size() + " reviews.")
                .data(responses)
                .build());
    }
}
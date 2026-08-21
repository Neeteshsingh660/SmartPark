package com.smartpark.dto.review;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long parkingSpotId;
    private Long bookingId;
    private String driverName; // We only expose the name, not the email, for privacy
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
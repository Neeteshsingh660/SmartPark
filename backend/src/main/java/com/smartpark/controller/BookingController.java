package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.booking.BookingRequest;
import com.smartpark.dto.booking.BookingResponse;
import com.smartpark.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DRIVER', 'OWNER', 'ADMIN')") // Allow any logged-in user to make/view bookings
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Principal principal) {

        // Wrap logic to catch IllegalStateException (Overlaps/Time issues)
        try {
            BookingResponse response = bookingService.createBooking(request, principal.getName());
            return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Booking created successfully. Pending payment.")
                    .data(response)
                    .build());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Principal principal) {
        List<BookingResponse> responses = bookingService.getMyBookings(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<BookingResponse>>builder()
                .success(true)
                .message("Fetched bookings successfully")
                .data(responses)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingDetails(
            @PathVariable Long id,
            Principal principal) {

        BookingResponse response = bookingService.getBookingDetails(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Fetched booking details successfully")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/extend")
    public ResponseEntity<ApiResponse<BookingResponse>> requestExtension(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer hours,
            Principal principal) {

        BookingResponse response = bookingService.requestExtension(id, hours, principal.getName());
        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Extension request submitted to space owner")
                .data(response)
                .build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            Principal principal) {

        BookingResponse response = bookingService.cancelBooking(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Booking cancelled successfully")
                .data(response)
                .build());
    }
}
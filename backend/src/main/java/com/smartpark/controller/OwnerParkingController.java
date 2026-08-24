package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.parking.ParkingSpotRequest;
import com.smartpark.dto.parking.ParkingSpotResponse;
import com.smartpark.dto.booking.BookingResponse;
import com.smartpark.service.BookingService;
import com.smartpark.service.ParkingSpotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/owner/parking")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'DRIVER', 'ADMIN')")
public class OwnerParkingController {

    private final ParkingSpotService parkingSpotService;
    private final BookingService bookingService;

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getOwnerBookings(Principal principal) {
        List<BookingResponse> bookings = bookingService.getOwnerBookings(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<BookingResponse>>builder()
                .success(true)
                .message("Fetched owner spot bookings successfully")
                .data(bookings)
                .build());
    }

    @PostMapping("/bookings/{id}/extension-response")
    public ResponseEntity<ApiResponse<BookingResponse>> respondToExtension(
            @PathVariable Long id,
            @RequestParam boolean approve,
            Principal principal) {

        BookingResponse response = bookingService.respondToExtension(id, approve, principal.getName());
        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .success(true)
                .message(approve ? "Extension approved successfully" : "Extension declined")
                .data(response)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ParkingSpotResponse>> createSpot(
            @Valid @RequestBody ParkingSpotRequest request,
            Principal principal) {

        ParkingSpotResponse response = parkingSpotService.createSpot(request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<ParkingSpotResponse>builder()
                .success(true)
                .message("Parking spot created successfully")
                .data(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingSpotResponse>>> getMySpots(Principal principal) {
        List<ParkingSpotResponse> spots = parkingSpotService.getMySpots(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<ParkingSpotResponse>>builder()
                .success(true)
                .message("Fetched parking spots successfully")
                .data(spots)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSpotResponse>> getSpotById(
            @PathVariable Long id,
            Principal principal) {

        ParkingSpotResponse response = parkingSpotService.getSpotById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<ParkingSpotResponse>builder()
                .success(true)
                .message("Fetched parking spot successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSpotResponse>> updateSpot(
            @PathVariable Long id,
            @Valid @RequestBody ParkingSpotRequest request,
            Principal principal) {

        ParkingSpotResponse response = parkingSpotService.updateSpot(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.<ParkingSpotResponse>builder()
                .success(true)
                .message("Parking spot updated successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpot(
            @PathVariable Long id,
            Principal principal) {

        parkingSpotService.deleteSpot(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("Parking spot deleted/unlisted successfully")
                .build());
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<ParkingSpotResponse>> toggleSpotStatus(
            @PathVariable Long id,
            Principal principal) {

        ParkingSpotResponse response = parkingSpotService.toggleSpotStatus(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<ParkingSpotResponse>builder()
                .success(true)
                .message("Spot status updated to " + response.getStatus())
                .data(response)
                .build());
    }
}
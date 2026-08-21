package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.booking.BookingResponse;
import com.smartpark.dto.booking.QrScanRequest;
import com.smartpark.service.CheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/owner/scan")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')") // ONLY Owners can scan QR codes!
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<BookingResponse>> checkIn(
            @Valid @RequestBody QrScanRequest request,
            Principal principal) {

        try {
            BookingResponse response = checkInService.checkInDriver(request.getQrToken(), principal.getName());
            return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Check-in successful! Driver is now ACTIVE.")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<BookingResponse>> checkOut(
            @Valid @RequestBody QrScanRequest request,
            Principal principal) {

        try {
            BookingResponse response = checkInService.checkOutDriver(request.getQrToken(), principal.getName());
            return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Check-out successful! Booking is now COMPLETED.")
                    .data(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
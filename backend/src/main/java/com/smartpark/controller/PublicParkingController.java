package com.smartpark.controller;

import com.smartpark.dto.ApiResponse;
import com.smartpark.dto.parking.PublicParkingSpotResponse;
import com.smartpark.dto.parking.ReservedSlotResponse;
import com.smartpark.service.PublicParkingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class PublicParkingController {

    private final PublicParkingService publicParkingService;

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<PublicParkingSpotResponse>>> searchNearbyParking(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean covered,
            @RequestParam(required = false) Boolean security,
            @RequestParam(required = false) Boolean evCharging) {

        List<PublicParkingSpotResponse> spots = publicParkingService.searchNearbyParking(
                latitude, longitude, radiusKm, maxPrice, covered, security, evCharging);

        return ResponseEntity.ok(ApiResponse.<List<PublicParkingSpotResponse>>builder()
                .success(true)
                .message("Found " + spots.size() + " parking spots nearby")
                .data(spots)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PublicParkingSpotResponse>> getParkingDetails(
            @PathVariable Long id,
            @RequestParam(required = false) Double userLat,
            @RequestParam(required = false) Double userLon) {

        PublicParkingSpotResponse response = publicParkingService.getParkingDetails(id, userLat, userLon);

        return ResponseEntity.ok(ApiResponse.<PublicParkingSpotResponse>builder()
                .success(true)
                .message("Fetched parking details successfully")
                .data(response)
                .build());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<ReservedSlotResponse>>> getSpotAvailability(@PathVariable Long id) {
        List<ReservedSlotResponse> reservedSlots = publicParkingService.getSpotAvailability(id);
        return ResponseEntity.ok(ApiResponse.<List<ReservedSlotResponse>>builder()
                .success(true)
                .message("Fetched spot availability")
                .data(reservedSlots)
                .build());
    }
}
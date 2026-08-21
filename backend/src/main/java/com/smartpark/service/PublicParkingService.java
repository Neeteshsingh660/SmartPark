package com.smartpark.service;

import com.smartpark.dto.parking.PublicParkingSpotResponse;
import com.smartpark.dto.parking.ReservedSlotResponse;
import com.smartpark.entity.Booking;
import com.smartpark.entity.BookingStatus;
import com.smartpark.entity.ParkingSpot;
import com.smartpark.entity.ParkingStatus;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSpotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicParkingService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final BookingRepository bookingRepository;
    private static final double EARTH_RADIUS_KM = 6371.0;

    public List<PublicParkingSpotResponse> searchNearbyParking(
            Double lat, Double lon, Double radiusKm,
            BigDecimal maxPrice, Boolean covered,
            Boolean security, Boolean evCharging) {

        // 1. Calculate Bounding Box (Rough Square) to limit DB query size
        double latDelta = radiusKm / 111.0;
        double lonDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));

        double minLat = lat - latDelta;
        double maxLat = lat + latDelta;
        double minLon = lon - lonDelta;
        double maxLon = lon + lonDelta;

        // 2. Fetch from DB using the Bounding Box
        List<ParkingSpot> roughSpots = parkingSpotRepository
                .findByStatusAndLatitudeBetweenAndLongitudeBetween(
                        ParkingStatus.AVAILABLE, minLat, maxLat, minLon, maxLon);

        LocalDateTime now = LocalDateTime.now();
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.PENDING, BookingStatus.PAYMENT_PENDING,
                BookingStatus.CONFIRMED, BookingStatus.ACTIVE
        );

        // 3. Apply Haversine distance, dynamic filters, and real-time spot capacity check
        return roughSpots.stream()
                .filter(spot -> {
                    double exactDistance = calculateHaversineDistance(lat, lon, spot.getLatitude(), spot.getLongitude());
                    return exactDistance <= radiusKm;
                })
                .filter(spot -> maxPrice == null || spot.getPricePerHour().compareTo(maxPrice) <= 0)
                .filter(spot -> covered == null || !covered || spot.isCovered())
                .filter(spot -> security == null || !security || spot.isSecurityAvailable())
                .filter(spot -> evCharging == null || !evCharging || spot.isEvChargingAvailable())
                .map(spot -> {
                    double distance = calculateHaversineDistance(lat, lon, spot.getLatitude(), spot.getLongitude());
                    long activeBookings = bookingRepository.countOverlappingBookings(
                            spot.getId(), now, now.plusMinutes(1), activeStatuses);
                    int totalCapacity = spot.getCapacity() != null ? spot.getCapacity() : 1;
                    int available = Math.max(0, totalCapacity - (int) activeBookings);
                    return mapToPublicResponse(spot, distance, available);
                })
                .filter(response -> response.getAvailableSpots() > 0) // Remove spots with 0 available spots
                .sorted(Comparator.comparingDouble(PublicParkingSpotResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    public PublicParkingSpotResponse getParkingDetails(Long id, Double userLat, Double userLon) {
        ParkingSpot spot = parkingSpotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found"));

        double distance = 0.0;
        if (userLat != null && userLon != null) {
            distance = calculateHaversineDistance(userLat, userLon, spot.getLatitude(), spot.getLongitude());
        }

        LocalDateTime now = LocalDateTime.now();
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.PENDING, BookingStatus.PAYMENT_PENDING,
                BookingStatus.CONFIRMED, BookingStatus.ACTIVE
        );
        long activeBookings = bookingRepository.countOverlappingBookings(
                spot.getId(), now, now.plusMinutes(1), activeStatuses);
        int totalCapacity = spot.getCapacity() != null ? spot.getCapacity() : 1;
        int available = Math.max(0, totalCapacity - (int) activeBookings);

        return mapToPublicResponse(spot, distance, available);
    }

    // Haversine Formula for exact distance between two coordinates
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    public List<ReservedSlotResponse> getSpotAvailability(Long spotId) {
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.PENDING, BookingStatus.PAYMENT_PENDING,
                BookingStatus.CONFIRMED, BookingStatus.ACTIVE
        );
        LocalDateTime now = LocalDateTime.now();
        List<Booking> upcomingBookings = bookingRepository
                .findByParkingSpotIdAndStatusInAndEndTimeAfterOrderByStartTimeAsc(spotId, activeStatuses, now);

        return upcomingBookings.stream()
                .map(b -> ReservedSlotResponse.builder()
                        .startTime(b.getStartTime())
                        .endTime(b.getEndTime())
                        .status(b.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    private PublicParkingSpotResponse mapToPublicResponse(ParkingSpot spot, double distanceKm, int availableSpots) {
        return PublicParkingSpotResponse.builder()
                .id(spot.getId())
                .title(spot.getTitle())
                .address(spot.getAddress())
                .city(spot.getCity())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .pricePerHour(spot.getPricePerHour())
                .capacity(spot.getCapacity())
                .availableSpots(availableSpots)
                .covered(spot.isCovered())
                .securityAvailable(spot.isSecurityAvailable())
                .evChargingAvailable(spot.isEvChargingAvailable())
                .imageUrl(spot.getImageUrl())
                .operatingHours(spot.getOperatingHours())
                .peakPricePerHour(spot.getPeakPricePerHour())
                .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                .build();
    }
}
package com.smartpark.service;

import com.smartpark.dto.parking.ParkingSpotRequest;
import com.smartpark.dto.parking.ParkingSpotResponse;
import com.smartpark.entity.ParkingSpot;
import com.smartpark.entity.ParkingStatus;
import com.smartpark.entity.User;
import com.smartpark.exception.ResourceNotFoundException;
import com.smartpark.repository.ParkingSpotRepository;
import com.smartpark.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParkingSpotService {

    private final ParkingSpotRepository parkingSpotRepository;
    private final UserRepository userRepository;

    public ParkingSpotResponse createSpot(ParkingSpotRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        if (owner.getRole() != com.smartpark.entity.Role.OWNER && owner.getRole() != com.smartpark.entity.Role.ADMIN) {
            owner.setRole(com.smartpark.entity.Role.OWNER);
            userRepository.save(owner);
        }

        ParkingSpot spot = ParkingSpot.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pricePerHour(request.getPricePerHour())
                .status(ParkingStatus.AVAILABLE)
                .capacity(request.getCapacity())
                .covered(request.isCovered())
                .securityAvailable(request.isSecurityAvailable())
                .evChargingAvailable(request.isEvChargingAvailable())
                .imageUrl(request.getImageUrl())
                .operatingHours(request.getOperatingHours())
                .peakPricePerHour(request.getPeakPricePerHour())
                .build();

        ParkingSpot savedSpot = parkingSpotRepository.save(spot);
        return mapToResponse(savedSpot);
    }

    public List<ParkingSpotResponse> getMySpots(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        return parkingSpotRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ParkingSpotResponse getSpotById(Long id, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        ParkingSpot spot = parkingSpotRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found or you don't have permission"));

        return mapToResponse(spot);
    }

    public ParkingSpotResponse updateSpot(Long id, ParkingSpotRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        ParkingSpot spot = parkingSpotRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found or you don't have permission"));

        spot.setTitle(request.getTitle());
        spot.setDescription(request.getDescription());
        spot.setAddress(request.getAddress());
        spot.setCity(request.getCity());
        spot.setLatitude(request.getLatitude());
        spot.setLongitude(request.getLongitude());
        spot.setPricePerHour(request.getPricePerHour());
        spot.setCapacity(request.getCapacity());
        spot.setCovered(request.isCovered());
        spot.setSecurityAvailable(request.isSecurityAvailable());
        spot.setEvChargingAvailable(request.isEvChargingAvailable());
        spot.setImageUrl(request.getImageUrl());
        spot.setOperatingHours(request.getOperatingHours());
        spot.setPeakPricePerHour(request.getPeakPricePerHour());

        ParkingSpot updatedSpot = parkingSpotRepository.save(spot);
        return mapToResponse(updatedSpot);
    }

    public void deleteSpot(Long id, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        ParkingSpot spot = parkingSpotRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found or you don't have permission"));

        try {
            // Attempt hard delete if no bookings exist
            parkingSpotRepository.delete(spot);
            parkingSpotRepository.flush();
        } catch (Exception e) {
            // If bookings exist (Foreign Key Constraint), soft-delete by deactivating spot so booking history remains intact
            spot.setStatus(ParkingStatus.INACTIVE);
            parkingSpotRepository.save(spot);
        }
    }

    public ParkingSpotResponse toggleSpotStatus(Long id, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        ParkingSpot spot = parkingSpotRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking spot not found or you don't have permission"));

        if (spot.getStatus() == ParkingStatus.INACTIVE) {
            spot.setStatus(ParkingStatus.AVAILABLE);
        } else {
            spot.setStatus(ParkingStatus.INACTIVE);
        }

        ParkingSpot updatedSpot = parkingSpotRepository.save(spot);
        return mapToResponse(updatedSpot);
    }

    private ParkingSpotResponse mapToResponse(ParkingSpot spot) {
        return ParkingSpotResponse.builder()
                .id(spot.getId())
                .ownerId(spot.getOwner().getId())
                .title(spot.getTitle())
                .description(spot.getDescription())
                .address(spot.getAddress())
                .city(spot.getCity())
                .latitude(spot.getLatitude())
                .longitude(spot.getLongitude())
                .pricePerHour(spot.getPricePerHour())
                .status(spot.getStatus())
                .capacity(spot.getCapacity())
                .covered(spot.isCovered())
                .securityAvailable(spot.isSecurityAvailable())
                .evChargingAvailable(spot.isEvChargingAvailable())
                .imageUrl(spot.getImageUrl())
                .operatingHours(spot.getOperatingHours())
                .peakPricePerHour(spot.getPeakPricePerHour())
                .createdAt(spot.getCreatedAt())
                .build();
    }
}
package com.smartpark.repository;

import com.smartpark.entity.ParkingSpot;
import com.smartpark.entity.ParkingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByOwnerId(Long ownerId);
    Optional<ParkingSpot> findByIdAndOwnerId(Long id, Long ownerId);

    long countByStatus(ParkingStatus status);

    // Bounding Box Query for highly optimized map fetching
    List<ParkingSpot> findByStatusAndLatitudeBetweenAndLongitudeBetween(
            ParkingStatus status,
            Double minLat, Double maxLat,
            Double minLon, Double maxLon
     
    );
}
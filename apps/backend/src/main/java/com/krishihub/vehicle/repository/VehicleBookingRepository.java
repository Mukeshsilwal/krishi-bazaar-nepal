package com.krishihub.vehicle.repository;

import com.krishihub.vehicle.entity.VehicleBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleBookingRepository extends JpaRepository<VehicleBooking, UUID> {
    Optional<VehicleBooking> findByShipmentId(UUID shipmentId);
}

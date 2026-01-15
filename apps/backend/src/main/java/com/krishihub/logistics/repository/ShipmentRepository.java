package com.krishihub.logistics.repository;

import com.krishihub.logistics.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    Optional<Shipment> findByOrderId(UUID orderId);
    Optional<Shipment> findByTrackingCode(String trackingCode);
    List<Shipment> findByStatus(Shipment.ShipmentStatus status);
    List<Shipment> findByBuyerId(UUID buyerId);
}

package com.krishihub.logistics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipments")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "source_location", nullable = false)
    private String sourceLocation;

    @Column(name = "destination_location", nullable = false)
    private String destinationLocation;

    @Column(name = "tracking_code", unique = true)
    private String trackingCode;

    @Column(name = "carrier_name")
    private String carrierName;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "driver_mobile", length = 15)
    private String driverMobile;

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;

    @Column(name = "delivery_time")
    private LocalDateTime deliveryTime;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public enum ShipmentStatus {
        CREATED,      // Equivalent to PENDING/CONFIRMED
        ASSIGNED,     // Driver assigned
        IN_TRANSIT,   // Shipped
        DELIVERED,
        CANCELLED
    }
}

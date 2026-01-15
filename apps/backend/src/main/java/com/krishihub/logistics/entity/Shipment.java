package com.krishihub.logistics.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;
import java.util.UUID;

/**
 * Represents a shipment lifecycle for an order after payment success.
 *
 * Design Notes:
 * - Shipment is created automatically via PaymentCompletedListener after payment success.
 * - One-to-one relationship with Order (enforced by unique constraint on orderId).
 * - Status transitions: CREATED → ASSIGNED → IN_TRANSIT → DELIVERED.
 *
 * Business Rules:
 * - Shipment can only be created AFTER payment success (enforced by event-driven architecture).
 * - buyerId is denormalized for quick ownership validation without joining Order table.
 * - Vehicle details (type, driver) are optional initially and filled during booking.
 *
 * Important:
 * - orderId unique constraint prevents duplicate shipments from payment retries.
 * - trackingCode is auto-generated and unique for customer tracking.
 * - Status ASSIGNED means vehicle/driver has been assigned (equivalent to VEHICLE_BOOKED).
 */
@Entity
@Table(name = "shipments", uniqueConstraints = {
    @UniqueConstraint(columnNames = "order_id")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Unique constraint prevents duplicate shipments from payment retries
    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;

    // Denormalized for ownership validation without joining Order table
    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

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

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "estimated_delivery")
    private Date estimatedDelivery;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "delivery_time")
    private Date deliveryTime;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    @LastModifiedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "last_updated")
    private Date lastUpdated;

    /**
     * Shipment status lifecycle.
     *
     * CREATED: Shipment created after payment, awaiting vehicle booking.
     * ASSIGNED: Vehicle and driver assigned (equivalent to VEHICLE_BOOKED).
     * IN_TRANSIT: Shipment picked up and in transit to destination.
     * DELIVERED: Successfully delivered to buyer.
     * CANCELLED: Cancelled by buyer or system (e.g., order refund).
     */
    public enum ShipmentStatus {
        CREATED,      // Awaiting vehicle booking
        ASSIGNED,     // Vehicle/driver assigned
        IN_TRANSIT,   // In transit to destination
        DELIVERED,    // Successfully delivered
        CANCELLED     // Cancelled
    }
}

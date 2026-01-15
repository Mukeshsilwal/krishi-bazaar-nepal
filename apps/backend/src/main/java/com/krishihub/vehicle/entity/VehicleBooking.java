package com.krishihub.vehicle.entity;

import com.krishihub.shared.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a vehicle booking for a shipment.
 *
 * Business Rules:
 * - One active booking per shipment (enforced by unique constraint on shipmentId).
 * - Booking can only be created when shipment status is CREATED.
 * - Once booked, shipment status automatically changes to ASSIGNED.
 *
 * Design Notes:
 * - Vehicle details (type, driver, contact) are captured at booking time.
 * - Estimated cost is calculated based on vehicle type and distance (future enhancement).
 * - Pickup datetime is buyer-specified for scheduling purposes.
 *
 * Future Extension Points:
 * - Integration with third-party fleet management APIs.
 * - GPS tracking integration via gpsDeviceId field.
 * - Dynamic pricing based on distance, vehicle type, and demand.
 * - Driver rating and feedback system.
 */
@Entity
@Table(name = "vehicle_bookings", uniqueConstraints = {
    @UniqueConstraint(columnNames = "shipment_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleBooking extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // One booking per shipment (enforced by unique constraint)
    @Column(name = "shipment_id", nullable = false, unique = true)
    private UUID shipmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    private VehicleType vehicleType;

    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Column(name = "driver_contact", length = 20)
    private String driverContact;

    @Column(name = "vehicle_number", length = 20)
    private String vehicleNumber;

    // Future: Calculate based on distance and vehicle type
    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "pickup_datetime")
    private LocalDateTime pickupDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Vehicle types available for Nepali agricultural logistics.
     *
     * TRACTOR: For farm-to-market transport, suitable for rural roads.
     * PICKUP: Small to medium loads, flexible for urban/rural areas.
     * TRUCK: Large loads, long-distance transport.
     * TEMPO: Small loads, urban deliveries.
     * MINI_TRUCK: Medium loads, versatile for various terrains.
     */
    public enum VehicleType {
        TRACTOR,
        PICKUP,
        TRUCK,
        TEMPO,
        MINI_TRUCK
    }

    /**
     * Booking status lifecycle.
     *
     * PENDING: Booking created, awaiting driver assignment.
     * CONFIRMED: Driver assigned and confirmed by system/admin.
     * IN_PROGRESS: Vehicle en route or loading.
     * COMPLETED: Delivery completed successfully.
     * CANCELLED: Booking cancelled by buyer or system.
     */
    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}

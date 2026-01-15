package com.krishihub.vehicle.service;

import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.repository.ShipmentRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.vehicle.entity.VehicleBooking;
import com.krishihub.vehicle.repository.VehicleBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Handles vehicle booking operations for shipments.
 *
 * Business Rules:
 * - Vehicle can only be booked when shipment status is CREATED.
 * - Only one active booking per shipment (enforced by unique constraint).
 * - Booking automatically updates shipment status to ASSIGNED.
 * - Only shipment owner (buyer) can book vehicle.
 *
 * Design Notes:
 * - Estimated cost calculation is placeholder (future: integrate distance API).
 * - Driver details are optional at booking time (can be assigned later by admin).
 * - Booking status transitions: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleBookingService {

    private final VehicleBookingRepository vehicleBookingRepository;
    private final ShipmentRepository shipmentRepository;

    /**
     * Creates a vehicle booking for a shipment.
     *
     * Validation:
     * - Shipment must exist and status must be CREATED.
     * - No existing booking for this shipment.
     * - Buyer must own the shipment (security check).
     *
     * Side Effects:
     * - Updates shipment status to ASSIGNED.
     * - Generates estimated cost based on vehicle type.
     */
    @Transactional
    public VehicleBooking bookVehicle(UUID shipmentId, VehicleBooking.VehicleType vehicleType, 
                                      java.time.LocalDateTime pickupDateTime, String notes, UUID buyerId) {
        
        // Validate shipment exists
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        // Security: Validate buyer ownership
        if (!shipment.getBuyerId().equals(buyerId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You are not authorized to book vehicle for this shipment");
        }

        // Business Rule: Can only book vehicle when shipment is in CREATED status
        if (shipment.getStatus() != Shipment.ShipmentStatus.CREATED) {
            throw new BadRequestException(
                "Vehicle can only be booked when shipment status is CREATED. Current status: " + shipment.getStatus());
        }

        // Check for existing booking
        if (vehicleBookingRepository.findByShipmentId(shipmentId).isPresent()) {
            throw new BadRequestException("Vehicle already booked for this shipment");
        }

        // Calculate estimated cost based on vehicle type
        BigDecimal estimatedCost = calculateEstimatedCost(vehicleType, shipment);

        // Create booking
        VehicleBooking booking = VehicleBooking.builder()
                .shipmentId(shipmentId)
                .vehicleType(vehicleType)
                .pickupDateTime(pickupDateTime)
                .estimatedCost(estimatedCost)
                .notes(notes)
                .status(VehicleBooking.BookingStatus.PENDING)
                .build();

        VehicleBooking savedBooking = vehicleBookingRepository.save(booking);

        // Update shipment status to ASSIGNED
        shipment.setStatus(Shipment.ShipmentStatus.ASSIGNED);
        shipment.setVehicleType(vehicleType.name());
        shipmentRepository.save(shipment);

        log.info("Vehicle booked successfully for shipment: {}, vehicle type: {}", shipmentId, vehicleType);

        return savedBooking;
    }

    /**
     * Retrieves vehicle booking by shipment ID.
     */
    public VehicleBooking getBookingByShipmentId(UUID shipmentId) {
        return vehicleBookingRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No vehicle booking found for this shipment"));
    }

    /**
     * Cancels a vehicle booking.
     *
     * Business Rule:
     * - Can only cancel if booking status is PENDING or CONFIRMED.
     * - Reverts shipment status back to CREATED.
     */
    @Transactional
    public void cancelBooking(UUID bookingId, UUID buyerId) {
        VehicleBooking booking = vehicleBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        // Validate ownership
        Shipment shipment = shipmentRepository.findById(booking.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        if (!shipment.getBuyerId().equals(buyerId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You are not authorized to cancel this booking");
        }

        // Business Rule: Can only cancel PENDING or CONFIRMED bookings
        if (booking.getStatus() == VehicleBooking.BookingStatus.COMPLETED ||
            booking.getStatus() == VehicleBooking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel booking with status: " + booking.getStatus());
        }

        booking.setStatus(VehicleBooking.BookingStatus.CANCELLED);
        vehicleBookingRepository.save(booking);

        // Revert shipment status to CREATED
        shipment.setStatus(Shipment.ShipmentStatus.CREATED);
        shipment.setVehicleType(null);
        shipmentRepository.save(shipment);

        log.info("Vehicle booking cancelled: {}", bookingId);
    }

    /**
     * Calculates estimated cost based on vehicle type.
     *
     * Future Enhancement:
     * - Integrate with distance calculation API (Google Maps, etc.).
     * - Apply dynamic pricing based on demand and season.
     * - Consider fuel prices and route difficulty.
     *
     * Current Implementation:
     * - Simple base rates per vehicle type.
     * - Placeholder for future integration.
     */
    private BigDecimal calculateEstimatedCost(VehicleBooking.VehicleType vehicleType, Shipment shipment) {
        // Base rates in NPR (Nepali Rupees)
        return switch (vehicleType) {
            case TRACTOR -> new BigDecimal("5000");
            case PICKUP -> new BigDecimal("3000");
            case TRUCK -> new BigDecimal("8000");
            case TEMPO -> new BigDecimal("2000");
            case MINI_TRUCK -> new BigDecimal("4000");
        };
    }
}

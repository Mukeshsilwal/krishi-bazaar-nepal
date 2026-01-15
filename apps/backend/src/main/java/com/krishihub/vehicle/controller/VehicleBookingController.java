package com.krishihub.vehicle.controller;

import com.krishihub.common.context.UserContextHolder;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.vehicle.dto.BookVehicleRequest;
import com.krishihub.vehicle.dto.VehicleBookingDto;
import com.krishihub.vehicle.entity.VehicleBooking;
import com.krishihub.vehicle.service.VehicleBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for vehicle booking operations.
 * <p>
 * Security:
 * - All endpoints require authentication.
 * - Ownership validation is performed at service layer.
 * - Only buyers can book vehicles for their own shipments.
 */
@RestController
@RequestMapping("/api/vehicle-bookings")
@RequiredArgsConstructor
public class VehicleBookingController {

    private final VehicleBookingService vehicleBookingService;

    /**
     * Books a vehicle for a shipment.
     * <p>
     * POST /api/vehicle-bookings/shipment/{shipmentId}
     * <p>
     * Business Rules:
     * - Shipment must be in CREATED status.
     * - Only shipment owner (buyer) can book vehicle.
     * - Automatically updates shipment status to ASSIGNED.
     */
    @PostMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'VENDOR')")
    public ResponseEntity<ApiResponse<VehicleBookingDto>> bookVehicle(
            @PathVariable UUID shipmentId,
            @RequestBody BookVehicleRequest request) {
        
        UUID buyerId = UserContextHolder.getUserId();
        
        VehicleBooking booking = vehicleBookingService.bookVehicle(
                shipmentId,
                request.getVehicleType(),
                request.getPickupDateTime(),
                request.getNotes(),
                buyerId
        );

        return ResponseEntity.ok(ApiResponse.success(
                "Vehicle booked successfully",
                VehicleBookingDto.fromEntity(booking)
        ));
    }

    /**
     * Retrieves vehicle booking details for a shipment.
     * <p>
     * GET /api/vehicle-bookings/shipment/{shipmentId}
     */
    @GetMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'VENDOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<VehicleBookingDto>> getBookingByShipment(
            @PathVariable UUID shipmentId) {
        
        VehicleBooking booking = vehicleBookingService.getBookingByShipmentId(shipmentId);
        
        return ResponseEntity.ok(ApiResponse.success(
                "Booking retrieved successfully",
                VehicleBookingDto.fromEntity(booking)
        ));
    }

    /**
     * Cancels a vehicle booking.
     * <p>
     * DELETE /api/vehicle-bookings/{bookingId}
     * <p>
     * Business Rule:
     * - Can only cancel PENDING or CONFIRMED bookings.
     * - Reverts shipment status to CREATED.
     */
    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('BUYER', 'FARMER', 'VENDOR')")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable UUID bookingId) {
        
        UUID buyerId = UserContextHolder.getUserId();
        vehicleBookingService.cancelBooking(bookingId, buyerId);
        
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
    }
}

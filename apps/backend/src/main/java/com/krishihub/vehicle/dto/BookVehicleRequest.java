package com.krishihub.vehicle.dto;

import com.krishihub.vehicle.entity.VehicleBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a vehicle booking.
 *
 * Validation:
 * - vehicleType is required.
 * - pickupDateTime must be in the future.
 * - notes are optional.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookVehicleRequest {
    
    private VehicleBooking.VehicleType vehicleType;
    private LocalDateTime pickupDateTime;
    private String notes;
}

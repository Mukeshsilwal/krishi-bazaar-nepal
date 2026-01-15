package com.krishihub.vehicle.dto;

import com.krishihub.vehicle.entity.VehicleBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for vehicle booking information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleBookingDto {
    
    private UUID id;
    private UUID shipmentId;
    private VehicleBooking.VehicleType vehicleType;
    private String driverName;
    private String driverContact;
    private String vehicleNumber;
    private BigDecimal estimatedCost;
    private LocalDateTime pickupDateTime;
    private VehicleBooking.BookingStatus status;
    private String notes;

    public static VehicleBookingDto fromEntity(VehicleBooking booking) {
        return VehicleBookingDto.builder()
                .id(booking.getId())
                .shipmentId(booking.getShipmentId())
                .vehicleType(booking.getVehicleType())
                .driverName(booking.getDriverName())
                .driverContact(booking.getDriverContact())
                .vehicleNumber(booking.getVehicleNumber())
                .estimatedCost(booking.getEstimatedCost())
                .pickupDateTime(booking.getPickupDateTime())
                .status(booking.getStatus())
                .notes(booking.getNotes())
                .build();
    }
}

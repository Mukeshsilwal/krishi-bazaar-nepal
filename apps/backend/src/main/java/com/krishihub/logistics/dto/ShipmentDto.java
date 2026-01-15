package com.krishihub.logistics.dto;

import com.krishihub.logistics.entity.Shipment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

/**
 * Response DTO for shipment information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDto {
    
    private UUID id;
    private UUID orderId;
    private UUID buyerId;
    private String sourceLocation;
    private String destinationLocation;
    private String trackingCode;
    private String carrierName;
    private String vehicleType;
    private String driverName;
    private String driverMobile;
    private Date estimatedDelivery;
    private Date deliveryTime;
    private Shipment.ShipmentStatus status;
    private Date createdAt;

    public static ShipmentDto fromEntity(Shipment shipment) {
        return ShipmentDto.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .buyerId(shipment.getBuyerId())
                .sourceLocation(shipment.getSourceLocation())
                .destinationLocation(shipment.getDestinationLocation())
                .trackingCode(shipment.getTrackingCode())
                .carrierName(shipment.getCarrierName())
                .vehicleType(shipment.getVehicleType())
                .driverName(shipment.getDriverName())
                .driverMobile(shipment.getDriverMobile())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .deliveryTime(shipment.getDeliveryTime())
                .status(shipment.getStatus())
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}

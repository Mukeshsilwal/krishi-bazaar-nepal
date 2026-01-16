package com.krishihub.logistics.controller;

import com.krishihub.logistics.dto.ShipmentDto;
import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.service.ShipmentService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for shipment operations.
 *
 * Security:
 * - Ownership validation is performed at service layer.
 * - Only buyers, farmers, or admins can access shipment details.
 * - Tracking by tracking code is public (no authentication required).
 */
@RestController
@RequestMapping("/api/logistics/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    /**
     * Retrieves shipment details by order ID.
     *
     * GET /api/logistics/shipments/{orderId}
     *
     * Security: Validates buyer/farmer ownership at service layer.
     */
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAuthority('LOGISTICS:READ')")
    public ResponseEntity<ApiResponse<ShipmentDto>> getShipmentByOrderId(@PathVariable UUID orderId) {
        Shipment shipment = shipmentService.getShipmentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(ShipmentDto.fromEntity(shipment)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('LOGISTICS:MANAGE')")
    public ResponseEntity<ApiResponse<Page<ShipmentDto>>> getAllShipments(Pageable pageable) {
        Page<Shipment> shipments = shipmentService.getAllShipments(pageable);
        return ResponseEntity.ok(ApiResponse.success(shipments.map(ShipmentDto::fromEntity)));
    }

    /**
     * Tracks shipment by tracking code (public access).
     *
     * GET /api/logistics/shipments/track/{trackingCode}
     *
     * Important: This endpoint is public for customer convenience.
     */
    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<ApiResponse<ShipmentDto>> trackShipment(@PathVariable String trackingCode) {
        Shipment shipment = shipmentService.getShipmentByTrackingCode(trackingCode);
        return ResponseEntity.ok(ApiResponse.success(ShipmentDto.fromEntity(shipment)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('LOGISTICS:MANAGE')")
    public ResponseEntity<ApiResponse<ShipmentDto>> updateShipmentStatus(@PathVariable UUID id, @RequestBody Shipment.ShipmentStatus status) {
        shipmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", null));
    }
}

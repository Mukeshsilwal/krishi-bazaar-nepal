package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.Shipment;
import com.krishihub.logistics.service.ShipmentService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/logistics/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Shipment>> getShipmentByOrderId(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getShipmentByOrderId(orderId)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<Shipment>>> getAllShipments(org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getAllShipments(pageable)));
    }

    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<ApiResponse<Shipment>> trackShipment(@PathVariable String trackingCode) {
        return ResponseEntity.ok(ApiResponse.success(shipmentService.getShipmentByTrackingCode(trackingCode)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(@PathVariable UUID id, @RequestBody Shipment.ShipmentStatus status) {
        shipmentService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", null));
    }
}

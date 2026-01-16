package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.service.PriceAlertService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/price-alerts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    @PostMapping
    public ResponseEntity<ApiResponse<PriceAlert>> createAlert(@RequestBody PriceAlert alert) {
        return ResponseEntity.ok(ApiResponse.success("Alert created successfully", priceAlertService.createAlert(alert)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PriceAlert>>> getUserAlerts(@RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(priceAlertService.getUserAlerts(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@PathVariable UUID id) {
        priceAlertService.deleteAlert(id);
        return ResponseEntity.ok(ApiResponse.success("Alert deleted successfully", null));
    }
}

package com.krishihub.marketprice.controller;

import com.krishihub.marketprice.entity.PriceAlert;
import com.krishihub.marketprice.service.PriceAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/price-alerts")
@RequiredArgsConstructor
public class PriceAlertController {

    private final PriceAlertService priceAlertService;

    @PostMapping
    public ResponseEntity<PriceAlert> createAlert(@RequestBody PriceAlert alert) {
        return ResponseEntity.ok(priceAlertService.createAlert(alert));
    }

    @GetMapping
    public ResponseEntity<List<PriceAlert>> getUserAlerts(@RequestParam UUID userId) {
        return ResponseEntity.ok(priceAlertService.getUserAlerts(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable UUID id) {
        priceAlertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}

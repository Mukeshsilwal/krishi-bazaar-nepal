package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.LogisticsOrder;
import com.krishihub.logistics.service.LogisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService logisticsService;

    @PostMapping("/book")
    public ResponseEntity<LogisticsOrder> bookLogistics(@RequestBody LogisticsOrder order) {
        return ResponseEntity.ok(logisticsService.bookLogistics(order));
    }

    @GetMapping("/status")
    public ResponseEntity<LogisticsOrder> getStatus(@RequestParam UUID orderId) {
        return ResponseEntity.ok(logisticsService.getLogisticsStatus(orderId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestBody LogisticsOrder.LogisticsStatus status) {
        logisticsService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }
}

package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.LogisticsOrder;
import com.krishihub.logistics.service.LogisticsService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.krishihub.common.context.UserContextHolder;

@RestController
@RequestMapping("/api/logistics")
@RequiredArgsConstructor
public class LogisticsController {

    private final LogisticsService logisticsService;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<LogisticsOrder>> bookLogistics(@RequestBody LogisticsOrder order) {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success("Logistics booked successfully", logisticsService.bookLogistics(userId, order)));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<LogisticsOrder>> getStatus(@RequestParam UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(logisticsService.getLogisticsStatus(orderId)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(@PathVariable UUID id,
            @RequestBody LogisticsOrder.LogisticsStatus status) {
        logisticsService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", null));
    }
}

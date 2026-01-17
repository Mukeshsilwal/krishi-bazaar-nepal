package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.AdvisoryFeedbackDTO;
import com.krishihub.advisory.dto.AdvisoryLogResponseDTO;
import com.krishihub.advisory.entity.WeatherAdvisory;
import com.krishihub.advisory.service.AdvisoryDeliveryLogService;
import com.krishihub.advisory.service.AdvisoryLogAnalyticsService;
import com.krishihub.advisory.service.WeatherAdvisoryService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/weather-advisories")
@RequiredArgsConstructor
public class WeatherAdvisoryController {

    private final WeatherAdvisoryService service;
    private final AdvisoryDeliveryLogService advisoryDeliveryLogService;
    private final AdvisoryLogAnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<WeatherAdvisory>>> getAllAdvisories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(ApiResponse.success("Advisories fetched", 
            com.krishihub.shared.dto.PaginatedResponse.from(service.getAllAdvisories(pageable))));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<WeatherAdvisory>>> getActiveAdvisories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "validUntil,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(ApiResponse.success("Active advisories fetched", 
            com.krishihub.shared.dto.PaginatedResponse.from(service.getActiveAdvisories(pageable))));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<WeatherAdvisory>> createAdvisory(@RequestBody WeatherAdvisory advisory) {
        return ResponseEntity.ok(ApiResponse.success("Advisory created", service.createAdvisory(advisory)));
    }

    @GetMapping("/test-broadcast")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testBroadcast(@RequestParam String district) {
        return ResponseEntity.ok(ApiResponse.success("Broadcast test result", service.testBroadcast(district)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Void>> deleteAdvisory(@PathVariable UUID id) {
        service.deleteAdvisory(id);
        return ResponseEntity.ok(ApiResponse.success("Advisory deleted", null));
    }

    /**
     * Submit farmer feedback on advisory
     * Uses centralized logging service
     */
    @PostMapping("/feedback")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(@RequestBody AdvisoryFeedbackDTO feedbackDTO) {
        advisoryDeliveryLogService.logFeedbackReceived(
                feedbackDTO.getDeliveryLogId(),
                feedbackDTO.getFeedback(),
                feedbackDTO.getComment());
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", null));
    }

    /**
     * Mark advisory as opened
     * Uses centralized logging service
     */
    @PostMapping("/opened/{deliveryLogId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsOpened(@PathVariable UUID deliveryLogId) {
        advisoryDeliveryLogService.logAdvisoryOpened(deliveryLogId);
        return ResponseEntity.ok(ApiResponse.success("Advisory marked as opened", null));
    }

    /**
     * Get delivery logs for a farmer
     * Uses centralized logging service
     */
    @GetMapping("/logs/farmer/{farmerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AdvisoryLogResponseDTO>>> getFarmerLogs(@PathVariable UUID farmerId) {
        List<AdvisoryLogResponseDTO> logs = advisoryDeliveryLogService.getFarmerAdvisoryHistory(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Delivery logs retrieved", logs));
    }

    /**
     * Get analytics data
     * Uses centralized analytics service
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
        cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
        java.util.Date since = cal.getTime();

        Map<String, Object> analytics = Map.of(
                "deliverySuccessRate", analyticsService.getDeliverySuccessRate(since),
                "openRate", analyticsService.getOpenRate(since),
                "feedbackRate", analyticsService.getFeedbackRate(since),
                "totalAdvisories", analyticsService.getTotalAdvisories(since),
                "feedbackDistribution", analyticsService.getFeedbackDistribution(),
                "channelPerformance", analyticsService.getChannelPerformance(since));

        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }
}

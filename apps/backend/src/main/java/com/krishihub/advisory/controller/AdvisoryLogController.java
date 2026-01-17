package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.*;
import com.krishihub.advisory.service.AdvisoryDeliveryLogService;
import com.krishihub.advisory.service.AdvisoryLogAnalyticsService;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.dto.CursorPageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

import com.krishihub.advisory.dto.DistrictRiskDto;

/**
 * Controller for Advisory Logs
 * Provides admin and farmer APIs for advisory tracking and analytics
 */
@RestController
@RequestMapping("/api/advisory-logs")
@RequiredArgsConstructor
public class AdvisoryLogController {

    private final AdvisoryDeliveryLogService logService;
    private final AdvisoryLogAnalyticsService analyticsService;

    /**
     * Get advisory logs with filters and pagination (Admin)
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<CursorPageResponse<AdvisoryLogResponseDTO>>> getAdvisoryLogs(
            @ModelAttribute AdvisoryLogFilterDTO filter) {

        CursorPageResponse<AdvisoryLogResponseDTO> response = logService.getAdvisoryLogs(filter);
        return ResponseEntity.ok(ApiResponse.success("Advisory logs retrieved", response));
    }

    /**
     * Get advisory log detail (Admin)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<AdvisoryLogDetailDTO>> getAdvisoryLogDetail(@PathVariable UUID id) {
        return logService.getAdvisoryLogDetail(id)
                .map(detail -> ResponseEntity.ok(ApiResponse.success("Advisory log detail retrieved", detail)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get analytics (Admin)
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<AdvisoryAnalyticsDTO>> getAnalytics(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since) {

        AdvisoryAnalyticsDTO analytics = analyticsService.getAnalytics(since);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }

    /**
     * Get district risk insights (Admin)
     */
    @GetMapping("/analytics/district-risk")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<List<DistrictRiskDto>>> getDistrictRiskInsights() {
        return ResponseEntity.ok(ApiResponse.success("District risk insights retrieved", logService.getDistrictRiskInsights()));
    }

    /**
     * Get alert fatigue detection (Admin)
     */
    @GetMapping("/analytics/alert-fatigue")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<Object>> getAlertFatigue(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since,
            @RequestParam(defaultValue = "10") int threshold) {
            
        java.util.Date startDate = since;
        if (startDate == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -7);
            startDate = cal.getTime();
        }

        var fatigue = analyticsService.detectAlertFatigue(startDate, threshold);
        return ResponseEntity.ok(ApiResponse.success("Alert fatigue detected", fatigue));
    }
    
    // ... skipped unaffected methods ...

    /**
     * Get high-risk districts (Admin)
     */
    @GetMapping("/analytics/high-risk-districts")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<List<String>>> getHighRiskDistricts(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since) {

        if (since == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
            since = cal.getTime();
        }

        List<String> districts = analyticsService.getHighRiskDistricts(since);
        return ResponseEntity.ok(ApiResponse.success("High-risk districts retrieved", districts));
    }

    /**
     * Get top performing rules (Admin)
     */
    @GetMapping("/analytics/top-rules")
    @PreAuthorize("hasAuthority('ADMIN:ANALYTICS')")
    public ResponseEntity<ApiResponse<List<String>>> getTopPerformingRules(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since,
            @RequestParam(defaultValue = "10") int limit) {

        if (since == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
            since = cal.getTime();
        }

        List<String> rules = analyticsService.getTopPerformingRules(since, limit);
        return ResponseEntity.ok(ApiResponse.success("Top performing rules retrieved", rules));
    }

    /**
     * Get underperforming rules (Admin)
     */
    @GetMapping("/analytics/underperforming-rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getUnderperformingRules(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since,
            @RequestParam(defaultValue = "10") int limit) {

        if (since == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
            since = cal.getTime();
        }

        List<String> rules = analyticsService.getUnderperformingRules(since, limit);
        return ResponseEntity.ok(ApiResponse.success("Underperforming rules retrieved", rules));
    }

    /**
     * Get farmer engagement score (Admin)
     */
    @GetMapping("/analytics/engagement-score")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Double>> getFarmerEngagementScore(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern="yyyy-MM-dd") java.util.Date since) {

        if (since == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
            since = cal.getTime();
        }

        Double score = analyticsService.getFarmerEngagementScore(since);
        return ResponseEntity.ok(ApiResponse.success("Engagement score retrieved", score));
    }

    /**
     * Submit feedback (Farmer)
     */
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(@RequestBody FeedbackSubmissionDTO feedbackDTO) {
        logService.logFeedbackReceived(feedbackDTO.logId(), feedbackDTO.feedback(), feedbackDTO.comment());
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", null));
    }

    /**
     * DTO for feedback submission
     */
    public record FeedbackSubmissionDTO(
            UUID logId,
            String feedback,
            String comment) {
    }
}

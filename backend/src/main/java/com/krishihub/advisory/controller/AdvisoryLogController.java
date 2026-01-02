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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CursorPageResponse<AdvisoryLogResponseDTO>>> getAdvisoryLogs(
            @ModelAttribute AdvisoryLogFilterDTO filter) {

        CursorPageResponse<AdvisoryLogResponseDTO> response = logService.getAdvisoryLogs(filter);
        return ResponseEntity.ok(ApiResponse.success("Advisory logs retrieved", response));
    }

    /**
     * Get advisory log detail (Admin)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdvisoryLogDetailDTO>> getAdvisoryLogDetail(@PathVariable UUID id) {
        return logService.getAdvisoryLogDetail(id)
                .map(detail -> ResponseEntity.ok(ApiResponse.success("Advisory log detail retrieved", detail)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get analytics (Admin)
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdvisoryAnalyticsDTO>> getAnalytics(
            @RequestParam(required = false) LocalDateTime since) {

        AdvisoryAnalyticsDTO analytics = analyticsService.getAnalytics(since);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved", analytics));
    }

    /**
     * Get district risk insights (Admin)
     */
    @GetMapping("/analytics/district-risk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getDistrictRiskInsights(
            @RequestParam(required = false) LocalDateTime since) {

        // TODO: Implement district risk insights
        return ResponseEntity.ok(ApiResponse.success("District risk insights", null));
    }

    /**
     * Get alert fatigue detection (Admin)
     */
    @GetMapping("/analytics/alert-fatigue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getAlertFatigue(
            @RequestParam(required = false) LocalDateTime since,
            @RequestParam(defaultValue = "10") int threshold) {

        var fatigue = analyticsService.detectAlertFatigue(
                since != null ? since : LocalDateTime.now().minusDays(7),
                threshold);
        return ResponseEntity.ok(ApiResponse.success("Alert fatigue detected", fatigue));
    }

    /**
     * Get farmer's advisory history (Farmer)
     */
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<ApiResponse<List<AdvisoryLogResponseDTO>>> getFarmerAdvisoryHistory(
            @PathVariable UUID farmerId) {

        List<AdvisoryLogResponseDTO> history = logService.getFarmerAdvisoryHistory(farmerId);
        return ResponseEntity.ok(ApiResponse.success("Farmer advisory history retrieved", history));
    }

    /**
     * Mark advisory as opened (Farmer)
     */
    @PostMapping("/opened/{logId}")
    public ResponseEntity<ApiResponse<Void>> markAsOpened(@PathVariable UUID logId) {
        logService.logAdvisoryOpened(logId);
        return ResponseEntity.ok(ApiResponse.success("Advisory marked as opened", null));
    }

    /**
     * Submit feedback (Farmer)
     */
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(@RequestBody FeedbackSubmissionDTO feedbackDTO) {
        logService.logFeedbackReceived(
                feedbackDTO.logId(),
                feedbackDTO.feedback(),
                feedbackDTO.comment());
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", null));
    }

    /**
     * Get high-risk districts (Admin)
     */
    @GetMapping("/analytics/high-risk-districts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getHighRiskDistricts(
            @RequestParam(required = false) LocalDateTime since) {

        if (since == null) {
            since = LocalDateTime.now().minusDays(30);
        }

        List<String> districts = analyticsService.getHighRiskDistricts(since);
        return ResponseEntity.ok(ApiResponse.success("High-risk districts retrieved", districts));
    }

    /**
     * Get top performing rules (Admin)
     */
    @GetMapping("/analytics/top-rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getTopPerformingRules(
            @RequestParam(required = false) LocalDateTime since,
            @RequestParam(defaultValue = "10") int limit) {

        if (since == null) {
            since = LocalDateTime.now().minusDays(30);
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
            @RequestParam(required = false) LocalDateTime since,
            @RequestParam(defaultValue = "10") int limit) {

        if (since == null) {
            since = LocalDateTime.now().minusDays(30);
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
            @RequestParam(required = false) LocalDateTime since) {

        if (since == null) {
            since = LocalDateTime.now().minusDays(30);
        }

        Double score = analyticsService.getFarmerEngagementScore(since);
        return ResponseEntity.ok(ApiResponse.success("Engagement score retrieved", score));
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

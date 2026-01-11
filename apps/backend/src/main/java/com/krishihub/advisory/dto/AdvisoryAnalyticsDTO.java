package com.krishihub.advisory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Analytics response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryAnalyticsDTO {
    // Overall metrics
    private Long totalAdvisories;
    private Double deliverySuccessRate;
    private Double openRate;
    private Double feedbackRate;

    // Channel performance
    private Map<String, ChannelMetrics> channelPerformance;

    // Rule effectiveness
    private Map<String, RuleMetrics> ruleEffectiveness;

    // Feedback distribution
    private Map<String, Long> feedbackDistribution;

    // District insights
    private Map<String, DistrictMetrics> districtInsights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChannelMetrics {
        private Long totalSent;
        private Long delivered;
        private Long opened;
        private Double successRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleMetrics {
        private String ruleName;
        private Long triggerCount;
        private Long openCount;
        private Double openRate;
        private Long usefulFeedback;
        private Long notUsefulFeedback;
        private Double feedbackRatio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistrictMetrics {
        private String district;
        private Long advisoryCount;
        private Long emergencyCount;
        private Double deliveryFailureRate;
    }
}

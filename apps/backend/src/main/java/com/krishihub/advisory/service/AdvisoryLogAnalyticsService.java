package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.AdvisoryAnalyticsDTO;
import com.krishihub.advisory.dto.AdvisoryAnalyticsDTO.*;
import com.krishihub.advisory.enums.DeliveryChannel;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Analytics service for advisory logs
 * Provides insights for rule tuning, district risk assessment, and farmer
 * engagement
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdvisoryLogAnalyticsService {

    private final AdvisoryDeliveryLogRepository repository;

    /**
     * Get comprehensive analytics
     */
    public AdvisoryAnalyticsDTO getAnalytics(java.util.Date since) {
        if (since == null) {
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
            since = cal.getTime();
        }

        log.info("Generating analytics since {}", since);

        return AdvisoryAnalyticsDTO.builder()
                .totalAdvisories(getTotalAdvisories(since))
                .deliverySuccessRate(getDeliverySuccessRate(since))
                .openRate(getOpenRate(since))
                .feedbackRate(getFeedbackRate(since))
                .channelPerformance(getChannelPerformance(since))
                .ruleEffectiveness(getRuleEffectiveness(since))
                .feedbackDistribution(getFeedbackDistribution())
                .districtInsights(getDistrictInsights(since))
                .build();
    }

    /**
     * Get total advisories count
     */
    public Long getTotalAdvisories(java.util.Date since) {
        return repository.countSince(since);
    }

    /**
     * Get delivery success rate
     */
    public Double getDeliverySuccessRate(java.util.Date since) {
        Double rate = repository.getDeliverySuccessRate(since);
        return rate != null ? rate : 0.0;
    }

    /**
     * Get open rate (opened / delivered)
     */
    public Double getOpenRate(java.util.Date since) {
        Double rate = repository.getOpenRate(since);
        return rate != null ? rate : 0.0;
    }

    /**
     * Get feedback rate (feedback / opened)
     */
    public Double getFeedbackRate(java.util.Date since) {
        Double rate = repository.getFeedbackRate(since);
        return rate != null ? rate : 0.0;
    }

    /**
     * Get channel performance metrics
     */
    public Map<String, ChannelMetrics> getChannelPerformance(java.util.Date since) {
        Map<String, ChannelMetrics> metrics = new HashMap<>();

        List<Object[]> channelStats = repository.getChannelStatistics(since);

        for (Object[] row : channelStats) {
            String channelName = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long totalSent = ((Number) row[1]).longValue();
            Long delivered = ((Number) row[2]).longValue();
            Long opened = ((Number) row[3]).longValue();

            double successRate = totalSent > 0 ? (delivered * 100.0 / totalSent) : 0.0;

            metrics.put(channelName, ChannelMetrics.builder()
                    .totalSent(totalSent)
                    .delivered(delivered)
                    .opened(opened)
                    .successRate(successRate)
                    .build());
        }

        // Ensure all channels are represented
        for (DeliveryChannel channel : DeliveryChannel.values()) {
            metrics.putIfAbsent(channel.name(), ChannelMetrics.builder()
                    .totalSent(0L)
                    .delivered(0L)
                    .opened(0L)
                    .successRate(0.0)
                    .build());
        }

        log.debug("Channel performance calculated for {} channels", metrics.size());
        return metrics;
    }

    /**
     * Get rule effectiveness metrics
     */
    public Map<String, RuleMetrics> getRuleEffectiveness(java.util.Date since) {
        Map<String, RuleMetrics> metrics = new HashMap<>();

        List<Object[]> ruleStats = repository.getRuleEffectivenessMetrics(since);

        for (Object[] row : ruleStats) {
            String ruleName = (String) row[0];
            Long triggerCount = ((Number) row[1]).longValue();
            Long openCount = ((Number) row[2]).longValue();
            Long usefulFeedback = ((Number) row[3]).longValue();
            Long notUsefulFeedback = ((Number) row[4]).longValue();

            double openRate = triggerCount > 0 ? (openCount * 100.0 / triggerCount) : 0.0;
            double feedbackRatio = (usefulFeedback + notUsefulFeedback) > 0
                    ? (usefulFeedback * 100.0 / (usefulFeedback + notUsefulFeedback))
                    : 0.0;

            metrics.put(ruleName, RuleMetrics.builder()
                    .ruleName(ruleName)
                    .triggerCount(triggerCount)
                    .openCount(openCount)
                    .openRate(openRate)
                    .usefulFeedback(usefulFeedback)
                    .notUsefulFeedback(notUsefulFeedback)
                    .feedbackRatio(feedbackRatio)
                    .build());
        }

        log.debug("Rule effectiveness calculated for {} rules", metrics.size());
        return metrics;
    }

    /**
     * Get feedback distribution
     */
    public Map<String, Long> getFeedbackDistribution() {
        Map<String, Long> distribution = new HashMap<>();

        List<Object[]> stats = repository.getFeedbackStatistics();
        for (Object[] row : stats) {
            String feedback = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            distribution.put(feedback, count);
        }

        // Ensure both feedback types are present
        distribution.putIfAbsent("USEFUL", 0L);
        distribution.putIfAbsent("NOT_USEFUL", 0L);
        distribution.putIfAbsent("NO_FEEDBACK", 0L);

        return distribution;
    }

    /**
     * Get district-wise insights
     */
    public Map<String, DistrictMetrics> getDistrictInsights(java.util.Date since) {
        Map<String, DistrictMetrics> insights = new HashMap<>();

        List<Object[]> districtStats = repository.getDistrictStatistics(since);

        for (Object[] row : districtStats) {
            String district = (String) row[0];
            Long advisoryCount = ((Number) row[1]).longValue();
            Long emergencyCount = ((Number) row[2]).longValue();
            Long failureCount = ((Number) row[3]).longValue();

            double failureRate = advisoryCount > 0 ? (failureCount * 100.0 / advisoryCount) : 0.0;

            insights.put(district, DistrictMetrics.builder()
                    .district(district)
                    .advisoryCount(advisoryCount)
                    .emergencyCount(emergencyCount)
                    .deliveryFailureRate(failureRate)
                    .build());
        }

        log.debug("District insights calculated for {} districts", insights.size());
        return insights;
    }

    /**
     * Detect alert fatigue (repeated advisories per farmer)
     */
    public Map<UUID, Long> detectAlertFatigue(java.util.Date since, int threshold) {
        log.info("Detecting alert fatigue with threshold {} since {}", threshold, since);

        List<Object[]> results = repository.findFarmersWithExcessiveAdvisories(since, threshold);

        return results.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> ((Number) row[1]).longValue()));
    }

    /**
     * Get ignored emergency alerts
     */
    public List<UUID> getIgnoredEmergencyAlerts(java.util.Date since) {
        log.info("Finding ignored emergency alerts since {}", since);
        return repository.findIgnoredEmergencyAlerts(since);
    }

    /**
     * Get rules with poor feedback ratio
     * 
     * @param threshold Minimum percentage of NOT_USEFUL feedback to be considered
     *                  poor
     * @return Map of rule name to NOT_USEFUL percentage
     */
    public Map<String, Double> getRulesWithPoorFeedback(double threshold) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
        cal.add(java.util.Calendar.DAY_OF_YEAR, -30);
        java.util.Date since = cal.getTime();
        
        long minFeedbackCount = 5; // Minimum feedback count to be statistically relevant

        log.info("Finding rules with poor feedback (threshold: {}%, min feedback: {})", threshold, minFeedbackCount);

        List<Object[]> results = repository.getRulesWithPoorFeedback(since, minFeedbackCount);

        Map<String, Double> poorRules = new HashMap<>();
        for (Object[] row : results) {
            String ruleName = (String) row[0];
            Double notUsefulPercentage = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;

            if (notUsefulPercentage >= threshold) {
                poorRules.put(ruleName, notUsefulPercentage);
            }
        }

        log.info("Found {} rules with poor feedback", poorRules.size());
        return poorRules;
    }

    /**
     * Get advisory trends over time
     */
    public Map<String, Long> getAdvisoryTrends(java.util.Date since, String groupBy) {
        // This would require more complex date grouping queries
        // For now, return basic counts
        Map<String, Long> trends = new HashMap<>();
        trends.put("total", repository.countSince(since));
        return trends;
    }

    /**
     * Get farmer engagement score
     * Combines open rate and feedback rate
     */
    public Double getFarmerEngagementScore(java.util.Date since) {
        Double openRate = getOpenRate(since);
        Double feedbackRate = getFeedbackRate(since);

        // Weighted average: 60% open rate, 40% feedback rate
        return (openRate * 0.6) + (feedbackRate * 0.4);
    }

    /**
     * Get high-risk districts (high emergency count + high failure rate)
     */
    public List<String> getHighRiskDistricts(java.util.Date since) {
        Map<String, DistrictMetrics> insights = getDistrictInsights(since);

        return insights.entrySet().stream()
                .filter(entry -> {
                    DistrictMetrics metrics = entry.getValue();
                    return metrics.getEmergencyCount() > 5
                            && metrics.getDeliveryFailureRate() > 10.0;
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Get top performing rules (high open rate + positive feedback)
     */
    public List<String> getTopPerformingRules(java.util.Date since, int limit) {
        Map<String, RuleMetrics> effectiveness = getRuleEffectiveness(since);

        return effectiveness.entrySet().stream()
                .filter(entry -> {
                    RuleMetrics metrics = entry.getValue();
                    return metrics.getOpenRate() > 50.0
                            && metrics.getFeedbackRatio() > 70.0
                            && metrics.getTriggerCount() > 10;
                })
                .sorted((e1, e2) -> {
                    // Sort by combination of open rate and feedback ratio
                    double score1 = e1.getValue().getOpenRate() + e1.getValue().getFeedbackRatio();
                    double score2 = e2.getValue().getOpenRate() + e2.getValue().getFeedbackRatio();
                    return Double.compare(score2, score1);
                })
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Get underperforming rules (low open rate or negative feedback)
     */
    public List<String> getUnderperformingRules(java.util.Date since, int limit) {
        Map<String, RuleMetrics> effectiveness = getRuleEffectiveness(since);

        return effectiveness.entrySet().stream()
                .filter(entry -> {
                    RuleMetrics metrics = entry.getValue();
                    return (metrics.getOpenRate() < 30.0
                            || metrics.getFeedbackRatio() < 40.0)
                            && metrics.getTriggerCount() > 10;
                })
                .sorted((e1, e2) -> {
                    // Sort by worst performance
                    double score1 = e1.getValue().getOpenRate() + e1.getValue().getFeedbackRatio();
                    double score2 = e2.getValue().getOpenRate() + e2.getValue().getFeedbackRatio();
                    return Double.compare(score1, score2);
                })
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}

package com.krishihub.advisory.service;

import com.krishihub.advisory.context.ContextBuilderService;
import com.krishihub.advisory.context.WeatherAdvisoryContext;
import com.krishihub.advisory.enums.AdvisoryType;
import com.krishihub.advisory.enums.Severity;
import com.krishihub.advisory.model.RuleResult;
import com.krishihub.advisory.repository.AdvisoryDeliveryLogRepository;
import com.krishihub.advisory.weather.WeatherIngestionService;
import com.krishihub.advisory.weather.model.WeatherSignal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.*;

/**
 * Main orchestration service for Weather Advisory system
 * Coordinates the entire flow from weather signal to notification delivery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAdvisoryOrchestrator {

    private final WeatherIngestionService weatherIngestionService;
    private final ContextBuilderService contextBuilderService;
    private final RuleEngineService ruleEngineService;
    private final WeatherAdvisoryNotificationService notificationService;
    private final AdvisoryDeliveryLogRepository deliveryLogRepository;
    private final AdvisoryDeliveryLogService advisoryDeliveryLogService;
    private final com.krishihub.auth.repository.UserRepository userRepository;

    // Deduplication cache to prevent alert storms
    private final Set<String> recentAlerts = Collections.synchronizedSet(new HashSet<>());

    /**
     * Scheduled task to process weather advisories
     * Runs every hour after weather data ingestion
     */
    @Scheduled(cron = "${weather.advisory.processing.cron:0 15 * * * *}")
    public void processWeatherAdvisories() {
        log.info("Starting scheduled weather advisory processing");

        try {
            // Get all weather signals
            Map<String, List<WeatherSignal>> districtSignals = weatherIngestionService.getAllWeatherSignals();

            if (districtSignals.isEmpty()) {
                log.info("No weather signals detected. Skipping advisory processing.");
                return;
            }

            log.info("Processing weather signals for {} districts", districtSignals.size());

            int totalAdvisories = 0;

            for (Map.Entry<String, List<WeatherSignal>> entry : districtSignals.entrySet()) {
                String district = entry.getKey();
                List<WeatherSignal> signals = entry.getValue();

                // Skip normal conditions
                if (signals.size() == 1 && signals.get(0) == WeatherSignal.NORMAL_CONDITIONS) {
                    continue;
                }

                log.info("Processing {} signals for district: {}", signals.size(), district);

                int advisoriesCreated = processDistrictAdvisories(district, signals);
                totalAdvisories += advisoriesCreated;
            }

            log.info("Completed weather advisory processing. Total advisories created: {}", totalAdvisories);

            // Clean up deduplication cache (keep only last hour)
            cleanupDeduplicationCache();

        } catch (Exception e) {
            log.error("Error processing weather advisories: {}", e.getMessage(), e);
        }
    }

    /**
     * Process advisories for a specific district
     */
    @Transactional
    public int processDistrictAdvisories(String district, List<WeatherSignal> signals) {
        log.debug("Processing advisories for district: {} with signals: {}", district, signals);

        // Build contexts for all farmers in the district
        List<WeatherAdvisoryContext> contexts = contextBuilderService.buildContextsForDistrict(district);

        if (contexts.isEmpty()) {
            log.warn("No farmer contexts found for district: {}", district);
            return 0;
        }

        log.info("Built {} contexts for district: {}", contexts.size(), district);

        int advisoriesCreated = 0;

        for (WeatherAdvisoryContext context : contexts) {
            try {
                boolean created = processAdvisoryForContext(context);
                if (created) {
                    advisoriesCreated++;
                }
            } catch (Exception e) {
                log.error("Error processing advisory for farmer {}: {}",
                        context.getFarmerId(), e.getMessage());
            }
        }

        return advisoriesCreated;
    }

    /**
     * Process advisory for a single context
     */
    @Transactional
    public boolean processAdvisoryForContext(WeatherAdvisoryContext context) {
        if (!context.isValid()) {
            log.warn("Invalid context for farmer: {}", context.getFarmerId());
            return false;
        }

        // Check deduplication
        String deduplicationKey = generateDeduplicationKey(context);
        if (recentAlerts.contains(deduplicationKey)) {
            log.debug("Skipping duplicate alert for farmer: {}", context.getFarmerId());
            return false;
        }

        // Build rule context
        Map<String, Object> ruleContext = buildRuleContext(context);

        // Execute rules
        List<RuleResult> ruleResults = ruleEngineService.executeRules(ruleContext);

        if (ruleResults.isEmpty()) {
            log.debug("No rules triggered for farmer: {}", context.getFarmerId());
            return false;
        }

        log.info("Triggered {} rules for farmer: {}", ruleResults.size(), context.getFarmerId());

        // Process each triggered rule
        for (RuleResult result : ruleResults) {
            try {
                // Create and send notification
                notificationService.createWeatherAdvisoryNotification(context, result);

                // Log delivery
                logAdvisoryDelivery(context, result);

                // Add to deduplication cache
                recentAlerts.add(deduplicationKey);

            } catch (Exception e) {
                log.error("Error processing rule result for farmer {}: {}",
                        context.getFarmerId(), e.getMessage());
            }
        }

        return true;
    }

    /**
     * Process advisory for a specific farmer (on-demand)
     */
    @Async
    public void processAdvisoryForFarmer(UUID farmerId) {
        log.info("Processing on-demand advisory for farmer: {}", farmerId);

        Optional<WeatherAdvisoryContext> contextOpt = contextBuilderService.buildContextForFarmer(farmerId);

        if (contextOpt.isEmpty()) {
            log.warn("Could not build context for farmer: {}", farmerId);
            return;
        }

        processAdvisoryForContext(contextOpt.get());
    }

    /**
     * Build rule context from advisory context
     */
    private Map<String, Object> buildRuleContext(WeatherAdvisoryContext context) {
        Map<String, Object> ruleContext = new HashMap<>();

        // Farmer information
        ruleContext.put("farmer_id", context.getFarmerId().toString());
        ruleContext.put("district", context.getFarmerDistrict());
        ruleContext.put("land_size", context.getLandSize());

        // Crop information
        ruleContext.put("crop_type", context.getCropType());
        ruleContext.put("growth_stage", context.getGrowthStage() != null ? context.getGrowthStage().name() : "UNKNOWN");

        // Weather signals
        if (context.getPrimarySignal() != null) {
            ruleContext.put("weather_signal", context.getPrimarySignal().name());
            ruleContext.put("signal_severity", context.getPrimarySignal().getSeverity().name());
        }

        // Weather data
        if (context.getCurrentWeather() != null) {
            ruleContext.put("temperature", context.getCurrentWeather().getTemperature());
            ruleContext.put("rainfall", context.getCurrentWeather().getRainfall());
            ruleContext.put("humidity", context.getCurrentWeather().getHumidity());
            ruleContext.put("wind_speed", context.getCurrentWeather().getWindSpeed());
        }

        // Seasonal context
        ruleContext.put("season", context.getSeason());
        ruleContext.put("is_monsoon", context.getIsMonsoonsoon());

        // Risk assessment
        ruleContext.put("risk_level", context.getRiskLevel());

        return ruleContext;
    }

    /**
     * Generate deduplication key
     */
    private String generateDeduplicationKey(WeatherAdvisoryContext context) {
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateTimeProvider.now());
        return String.format("%s:%s:%s:%s",
                context.getFarmerId(),
                context.getPrimarySignal(),
                context.getCropType(),
                cal.get(java.util.Calendar.HOUR_OF_DAY));
    }

    /**
     * Log advisory delivery using centralized service
     */
    private void logAdvisoryDelivery(WeatherAdvisoryContext context, RuleResult result) {
        try {
            // Map WeatherSignal severity to Severity enum
            Severity severity = mapWeatherSignalToSeverity(context.getPrimarySignal());

            // Build advisory content snapshot
            String advisoryContent = buildAdvisoryContentSnapshot(context, result);

            // Fetch farmer details (In a real high-throughput system, this should likely be cached or passed in context)
            com.krishihub.auth.entity.User farmer = userRepository.findById(context.getFarmerId()).orElse(null);
            String farmerName = farmer != null ? farmer.getName() : "Unknown";
            String farmerPhone = farmer != null ? farmer.getMobileNumber() : null;

            // Use the centralized logging service
            advisoryDeliveryLogService.logAdvisoryCreated(
                    context.getFarmerId(),
                    farmerName,
                    farmerPhone,
                    result.getRuleId(),
                    result.getRuleName(),
                    AdvisoryType.WEATHER,
                    severity,
                    advisoryContent,
                    context.getFarmerDistrict(),
                    context.getCropType(),
                    context.getGrowthStage() != null ? context.getGrowthStage().name() : null,
                    context.getPrimarySignal() != null ? context.getPrimarySignal().name() : null);

            log.debug("Logged advisory delivery for farmer {} with rule {} and signal {}",
                    context.getFarmerId(), result.getRuleName(),
                    context.getPrimarySignal() != null ? context.getPrimarySignal().name() : "NONE");

        } catch (Exception e) {
            log.error("Error logging advisory delivery: {}", e.getMessage());
        }
    }

    /**
     * Map WeatherSignal severity to Severity enum
     */
    private Severity mapWeatherSignalToSeverity(WeatherSignal signal) {
        if (signal == null) {
            return Severity.INFO;
        }

        return switch (signal.getSeverity()) {
            case INFO -> Severity.INFO;
            case WATCH -> Severity.WATCH;
            case WARNING -> Severity.WARNING;
            case EMERGENCY -> Severity.EMERGENCY;
        };
    }

    /**
     * Build advisory content snapshot for audit trail
     */
    private String buildAdvisoryContentSnapshot(WeatherAdvisoryContext context, RuleResult result) {
        StringBuilder content = new StringBuilder();
        content.append("Rule: ").append(result.getRuleName()).append("\n");
        content.append("Match Reason: ").append(result.getMatchReason()).append("\n");
        content.append("Signal: ").append(context.getPrimarySignal()).append("\n");
        content.append("District: ").append(context.getFarmerDistrict()).append("\n");
        content.append("Crop: ").append(context.getCropType()).append("\n");
        if (context.getCurrentWeather() != null) {
            content.append("Temperature: ").append(context.getCurrentWeather().getTemperature()).append("°C\n");
            content.append("Rainfall: ").append(context.getCurrentWeather().getRainfall()).append("mm\n");
        }
        return content.toString();
    }

    /**
     * Clean up deduplication cache
     */
    private void cleanupDeduplicationCache() {
        recentAlerts.clear();
        log.debug("Cleaned up deduplication cache");
    }

    /**
     * Get orchestrator health status
     */
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("weatherIngestionAvailable", weatherIngestionService.isAnyProviderAvailable());
        status.put("recentAlertsCount", recentAlerts.size());
        status.put("lastProcessingTime", com.krishihub.common.util.DateTimeProvider.now());

        return status;
    }
}

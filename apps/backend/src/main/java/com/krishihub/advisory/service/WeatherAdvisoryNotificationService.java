package com.krishihub.advisory.service;

import com.krishihub.advisory.context.WeatherAdvisoryContext;
import com.krishihub.advisory.model.RuleResult;
import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.enums.NotificationChannel;
import com.krishihub.notification.enums.NotificationPriority;
import com.krishihub.notification.enums.NotificationStatus;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Map;

/**
 * Specialized service for creating weather advisory notifications
 * Handles deduplication and multi-channel delivery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherAdvisoryNotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Create and send weather advisory notification
     */
    @Transactional
    public void createWeatherAdvisoryNotification(WeatherAdvisoryContext context, RuleResult ruleResult) {
        log.info("Creating weather advisory notification for farmer: {}", context.getFarmerId());

        // Determine priority based on signal severity
        NotificationPriority priority = determinePriority(context);

        // Determine channel based on priority
        NotificationChannel channel = determineChannel(priority);

        // Build notification message
        String title = buildNotificationTitle(context);
        String message = buildNotificationMessage(context, ruleResult);

        // Create notification
        Notification notification = Notification.builder()
                .userId(context.getFarmerId())
                .type("WEATHER_ADVISORY")
                .title(title)
                .message(message)
                .channel(channel)
                .priority(priority)
                .status(NotificationStatus.PENDING)
                .scheduledAt(com.krishihub.common.util.DateUtil.nowUtc())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    context.getFarmerId().toString(),
                    "/queue/notifications",
                    saved);

            // Update status to delivered
            saved.setStatus(NotificationStatus.SENT);
            saved.setSentAt(com.krishihub.common.util.DateUtil.nowUtc());
            notificationRepository.save(saved);

            log.info("Weather advisory notification sent successfully to farmer: {}", context.getFarmerId());

        } catch (Exception e) {
            log.error("Failed to send real-time notification: {}", e.getMessage());
            saved.setStatus(NotificationStatus.FAILED);
            saved.setFailureReason(e.getMessage());
            notificationRepository.save(saved);
        }
    }

    /**
     * Determine notification priority based on context
     */
    private NotificationPriority determinePriority(WeatherAdvisoryContext context) {
        if (context.getPrimarySignal() == null) {
            return NotificationPriority.NORMAL;
        }

        return switch (context.getPrimarySignal().getSeverity()) {
            case EMERGENCY -> NotificationPriority.EMERGENCY;
            case WARNING -> NotificationPriority.HIGH;
            case WATCH -> NotificationPriority.NORMAL;
            default -> NotificationPriority.LOW;
        };
    }

    /**
     * Determine notification channel based on priority
     */
    private NotificationChannel determineChannel(NotificationPriority priority) {
        return switch (priority) {
            case EMERGENCY -> NotificationChannel.SMS; // Emergency uses SMS
            case HIGH -> NotificationChannel.PUSH; // High priority uses push
            default -> NotificationChannel.PUSH; // Default to push (in-app handled by WebSocket)
        };
    }

    /**
     * Build notification title
     */
    private String buildNotificationTitle(WeatherAdvisoryContext context) {
        if (context.getPrimarySignal() == null) {
            return "Weather Advisory";
        }

        String severity = context.getPrimarySignal().getSeverity().name();
        String signal = context.getPrimarySignal().getDescription();

        return String.format("%s: %s", severity, signal);
    }

    /**
     * Build notification message
     */
    private String buildNotificationMessage(WeatherAdvisoryContext context, RuleResult ruleResult) {
        StringBuilder message = new StringBuilder();

        // Add weather signal description
        if (context.getPrimarySignal() != null) {
            message.append(context.getPrimarySignal().getDescription()).append("\n\n");
        }

        // Add location
        message.append("📍 Location: ").append(context.getFarmerDistrict()).append("\n");

        // Add crop information
        if (context.getCropType() != null) {
            message.append("🌾 Crop: ").append(context.getCropType());
            if (context.getGrowthStage() != null) {
                message.append(" (").append(context.getGrowthStage().name()).append(")");
            }
            message.append("\n");
        }

        // Add identified risks
        if (context.getIdentifiedRisks() != null && !context.getIdentifiedRisks().isEmpty()) {
            message.append("\n⚠️ Risks:\n");
            for (String risk : context.getIdentifiedRisks()) {
                message.append("• ").append(risk).append("\n");
            }
        }

        // Add recommended actions
        message.append("\n✅ Recommended Actions:\n");
        message.append(getRecommendedActions(context));

        // Add validity
        message.append("\n\n⏰ Valid until: ");
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
        cal.add(java.util.Calendar.DAY_OF_YEAR, 1);
        message.append(cal.getTime());

        return message.toString();
    }

    /**
     * Get recommended actions based on context
     */
    private String getRecommendedActions(WeatherAdvisoryContext context) {
        if (context.getPrimarySignal() == null) {
            return "Monitor weather conditions closely.";
        }

        StringBuilder actions = new StringBuilder();

        switch (context.getPrimarySignal()) {
            case HEAVY_RAIN_EXPECTED, FLOOD_RISK -> {
                actions.append("• Ensure proper drainage in fields\n");
                actions.append("• Protect harvested crops from moisture\n");
                actions.append("• Avoid irrigation until rain subsides\n");
            }
            case HEAT_WAVE_ALERT, HIGH_TEMPERATURE -> {
                actions.append("• Increase irrigation frequency\n");
                actions.append("• Apply mulch to conserve soil moisture\n");
                actions.append("• Provide shade for sensitive crops\n");
            }
            case FROST_RISK, COLD_WAVE_ALERT -> {
                actions.append("• Cover young plants overnight\n");
                actions.append("• Use frost protection methods\n");
                actions.append("• Delay planting if possible\n");
            }
            case HIGH_HUMIDITY_RISK -> {
                actions.append("• Monitor for fungal diseases\n");
                actions.append("• Improve air circulation\n");
                actions.append("• Apply preventive fungicides if needed\n");
            }
            case STORM_ALERT, STRONG_WIND -> {
                actions.append("• Secure loose equipment and materials\n");
                actions.append("• Provide support to tall crops\n");
                actions.append("• Postpone spraying operations\n");
            }
            case DROUGHT_WARNING -> {
                actions.append("• Conserve water resources\n");
                actions.append("• Use drip irrigation if available\n");
                actions.append("• Apply mulch to reduce evaporation\n");
            }
            default -> actions.append("• Monitor weather conditions\n")
                    .append("• Take appropriate precautions\n");
        }

        // Add growth stage specific advice
        if (context.getGrowthStage() != null && context.getGrowthStage().isWeatherSensitive()) {
            actions.append("• ").append(context.getGrowthStage().getWeatherProtectionAdvice()).append("\n");
        }

        return actions.toString();
    }
}

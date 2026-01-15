package com.krishihub.disease.advisory;

import com.krishihub.advisory.model.RuleResult;
import com.krishihub.disease.model.SignalPayload;
import com.krishihub.notification.service.NotificationService;
import com.krishihub.notification.entity.Notification; // Assuming entity exists
import com.krishihub.notification.enums.NotificationChannel;
import com.krishihub.notification.enums.NotificationPriority;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import com.krishihub.disease.repository.AdvisoryFeedbackRepository;


@Service
@RequiredArgsConstructor
public class AdvisoryService {

    private final NotificationService notificationService;
    private final AdvisoryFeedbackRepository feedbackRepository;

    public void handleRuleResult(RuleResult result, SignalPayload signal) {
        if (result.getActions() == null)
            return;

        result.getActions().forEach(action -> {
            if ("GENERATE_ADVISORY".equals(action.getType())) {
                sendAdvisory(action.getPayload(), signal);
            }
        });
    }

    private void sendAdvisory(Map<String, Object> payload, SignalPayload signal) {
        String diseaseName = (String) payload.getOrDefault("disease", "Unknown Issue");
        String severity = (String) payload.getOrDefault("severity", "MEDIUM");

        String message = String.format("Alert: Possible %s detected (%s severity) in %s. Check app for remedies.",
                diseaseName, severity, signal.getCropName());

        // This is a simplified integration.
        // Real implementation would look up a localized template.

        try {
            if (signal.getSourceUserId() != null) {
                notificationService.createNotification(
                        signal.getSourceUserId(),
                        "DISEASE_ALERT",
                        message);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void submitFeedback(com.krishihub.disease.dto.AdvisoryFeedbackDTO feedbackDTO) {
        com.krishihub.disease.entity.AdvisoryFeedback feedback = com.krishihub.disease.entity.AdvisoryFeedback.builder()
                .userId(feedbackDTO.getUserId())
                .diseaseId(feedbackDTO.getDiseaseId())
                .queryText(feedbackDTO.getQueryText())
                .isHelpful(feedbackDTO.isHelpful())
                .comments(feedbackDTO.getComments())
                .createdAt(com.krishihub.common.util.DateTimeProvider.now())
                .build();
        feedbackRepository.save(feedback);
    }
}

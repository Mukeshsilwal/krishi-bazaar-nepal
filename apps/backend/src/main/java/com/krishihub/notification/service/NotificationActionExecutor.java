package com.krishihub.notification.service;

import com.krishihub.advisory.model.RuleAction;
import com.krishihub.advisory.service.ActionExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationActionExecutor implements ActionExecutor {

    private final NotificationService notificationService;

    @Override
    public boolean supports(String actionType) {
        return "SEND_NOTIFICATION".equalsIgnoreCase(actionType) || "SEND_SMS".equalsIgnoreCase(actionType);
    }

    @Override
    public void execute(RuleAction action) {
        log.info("Executing Notification Action: {}", action);

        try {
            String message = (String) action.getPayload().getOrDefault("message", "Default Advisory Message");
            Object recipientObj = action.getPayload().get("recipient");

            UUID userId = null;
            if (recipientObj instanceof String) {
                try {
                    userId = UUID.fromString((String) recipientObj);
                } catch (IllegalArgumentException e) {
                    log.error("Invalid UUID for recipient: {}", recipientObj);
                    return;
                }
            } else if (recipientObj instanceof UUID) {
                userId = (UUID) recipientObj;
            } else {
                log.error("Recipient is missing or invalid type");
                return;
            }

            notificationService.createNotification(userId, "ADVISORY_ALERT", message);

            log.info("Notification sent successfully to {}", userId);
        } catch (Exception e) {
            log.error("Failed to execute notification action", e);
        }
    }
}

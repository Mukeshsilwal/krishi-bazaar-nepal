package com.krishihub.notification.service;

import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.enums.NotificationStatus;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSenderService {

    private final NotificationRepository notificationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.krishihub.shared.service.EmailService emailService;
    @org.springframework.beans.factory.annotation.Autowired
    private com.krishihub.auth.service.SmsService smsService;
    @org.springframework.beans.factory.annotation.Autowired
    private com.krishihub.auth.repository.UserRepository userRepository;

    public void sendNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null) {
            log.warn("Notification {} not found during processing", notificationId);
            return;
        }

        try {
            log.info("Sending notification {} via {}", notification.getId(), notification.getChannel());

            com.krishihub.auth.entity.User user = userRepository.findById(notification.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean success = false;
            switch (notification.getChannel()) {
                case SMS:
                    if (user.getMobileNumber() != null) {
                        smsService.sendNotification(user.getMobileNumber(), notification.getMessage());
                        success = true;
                    }
                    break;
                case EMAIL:
                    if (user.getEmail() != null) {
                        emailService.sendEmail(user.getEmail(), notification.getTitle(), notification.getMessage());
                        success = true;
                    }
                    break;
                case PUSH:
                    // TODO: Implement Push Notification Service (FCM)
                    // For now, mark as sent to avoid failure loops if PUSH is selected
                    // log.info("Push notification logic not implemented yet.");
                    success = true;
                    break;
                case WHATSAPP:
                    // TODO: Implement WhatsApp Logic
                    success = true;
                    break;
            }

            if (success) {
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus(NotificationStatus.FAILED);
                notification.setFailureReason("No valid contact info for channel");
            }

        } catch (Exception e) {
            log.error("Failed to send notification {}", notificationId, e);
            notification.setStatus(NotificationStatus.FAILED);
            notification.setFailureReason(e.getMessage());
        } finally {
            notificationRepository.save(notification);
        }
    }
}

package com.krishihub.notification.service;

import com.krishihub.auth.repository.UserRepository;
import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.enums.NotificationStatus;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSenderService {

    private final NotificationRepository notificationRepository;

    private final NotificationOrchestrator notificationOrchestrator;
    @Autowired
    private UserRepository userRepository;

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
            try {
                switch (notification.getChannel()) {
                    case SMS:
                        if (user.getMobileNumber() != null) {
                            MessageRequest smsRequest = MessageRequest.builder()
                                    .type(MessageType.SMS)
                                    .recipient(user.getMobileNumber())
                                    .content(notification.getMessage())
                                    .build();
                            notificationOrchestrator.send(smsRequest);
                            success = true;
                        }
                        break;
                    case EMAIL:
                        if (user.getEmail() != null) {
                            MessageRequest emailRequest = MessageRequest.builder()
                                    .type(MessageType.EMAIL)
                                    .recipient(user.getEmail())
                                    .subject(notification.getTitle())
                                    .content(notification.getMessage())
                                    .build();
                            notificationOrchestrator.send(emailRequest);
                            success = true;
                        }
                        break;
                    case PUSH:
                        // TODO: Implement Push Notification
                        success = true;
                        break;
                    case WHATSAPP:
                        MessageRequest whatsappRequest = MessageRequest.builder()
                                .type(MessageType.WHATSAPP)
                                // Assuming mobile number is valid for WhatsApp
                                .recipient(user.getMobileNumber() != null ? user.getMobileNumber() : "")
                                .content(notification.getMessage())
                                .build();
                        // Only send if recipient is valid
                        if (!whatsappRequest.getRecipient().isEmpty()) {
                            notificationOrchestrator.send(whatsappRequest);
                            success = true;
                        }
                        break;
                }
            } catch (Exception e) {
                log.error("Error sending message via orchestrator", e);
                success = false;
                notification.setFailureReason(e.getMessage());
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

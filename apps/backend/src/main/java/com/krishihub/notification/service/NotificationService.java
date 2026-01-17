package com.krishihub.notification.service;

import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.krishihub.notification.repository.DeviceTokenRepository deviceTokenRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               @org.springframework.context.annotation.Lazy SimpMessagingTemplate messagingTemplate,
                               com.krishihub.notification.repository.DeviceTokenRepository deviceTokenRepository) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.deviceTokenRepository = deviceTokenRepository;
    }

    public void registerDeviceToken(UUID userId, String token, String deviceType) {
        // Remove token from other users if it exists (tokens must be unique)
        deviceTokenRepository.findByToken(token).ifPresent(existing -> {
            deviceTokenRepository.delete(existing);
        });

        com.krishihub.notification.entity.DeviceToken deviceToken = com.krishihub.notification.entity.DeviceToken.builder()
                .userId(userId)
                .token(token)
                .deviceType(deviceType)
                .build();
        deviceTokenRepository.save(deviceToken);
        log.info("Registered device token for user {}: {}", userId, token);
    }

    @Async
    public void createNotification(UUID userId, String type, String message) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push real-time notification
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", saved);
        } catch (Exception e) {
            // Log error but don't fail transaction
            log.error("Failed to push websocket notification to user {}: {}", userId, e.getMessage(), e);
        }

        // Integration with SMS/Push Service would go here
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).size();
    }
}

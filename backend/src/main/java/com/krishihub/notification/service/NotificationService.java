package com.krishihub.notification.service;

import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    // Assuming SimpMessagingTemplate is available from existing WebSocket config
    // If not, we can remove this dependency or ensure it's configured
    private final SimpMessagingTemplate messagingTemplate; 

    @org.springframework.scheduling.annotation.Async
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
            System.err.println("Failed to push websocket notification: " + e.getMessage());
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

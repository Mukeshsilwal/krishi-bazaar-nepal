package com.krishihub.notification.service;

import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.entity.NotificationTemplate;
import com.krishihub.notification.repository.NotificationRepository;
import com.krishihub.notification.repository.NotificationTemplateRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationProducerService producerService;

    private final com.krishihub.auth.repository.UserRepository userRepository;

    public List<NotificationTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new java.util.HashMap<>();

        long totalSent = notificationRepository.countByStatus(com.krishihub.notification.enums.NotificationStatus.SENT);
        long pending = notificationRepository
                .countByStatus(com.krishihub.notification.enums.NotificationStatus.PENDING);
        long queued = notificationRepository.countByStatus(com.krishihub.notification.enums.NotificationStatus.QUEUED);
        long failed = notificationRepository.countByStatus(com.krishihub.notification.enums.NotificationStatus.FAILED);

        stats.put("totalSent", totalSent);
        stats.put("pending", pending);
        stats.put("queued", queued);

        long totalAttempts = totalSent + failed;
        double deliveryRate = totalAttempts > 0 ? ((double) totalSent / totalAttempts) * 100 : 0;

        stats.put("deliveryRate", Math.round(deliveryRate * 10.0) / 10.0);
        stats.put("activeUsers", notificationRepository.countDistinctUsers());
        stats.put("totalTargetableUsers", userRepository.count());
        stats.put("scheduled", notificationRepository.countByScheduledAtGreaterThan(java.time.LocalDateTime.now()));

        return stats;
    }

    public void sendBroadcast(String title, String message, String channel, String role, String targetValue,
            String priority) {
        List<com.krishihub.auth.entity.User> users;

        if ("SINGLE".equalsIgnoreCase(role)) {
            com.krishihub.auth.entity.User user = userRepository.findByMobileNumber(targetValue)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with mobile: " + targetValue));
            users = java.util.Collections.singletonList(user);
        } else if ("ALL".equalsIgnoreCase(role)) {
            users = userRepository.findAll();
        } else {
            // Correctly filter users based on the role Enum field logic
            users = userRepository.findAll().stream()
                    .filter(u -> u.getRole().name().equalsIgnoreCase(role))
                    .toList();
        }

        users.forEach(user -> {
            Notification notification = Notification.builder()
                    .userId(user.getId())
                    .title(title)
                    .message(message)
                    .type("BROADCAST")
                    .channel(com.krishihub.notification.enums.NotificationChannel.valueOf(channel))
                    .status(com.krishihub.notification.enums.NotificationStatus.PENDING)
                    .priority(com.krishihub.notification.enums.NotificationPriority.valueOf(priority))
                    .isRead(false)
                    .build();

            notification = notificationRepository.save(notification);
            producerService.sendToQueue(notification);
        });
    }

    @Transactional
    public NotificationTemplate createTemplate(NotificationTemplate template) {
        return templateRepository.save(template);
    }

    public void sendTemplatedNotification(String templateName, UUID userId, Map<String, String> params) {
        NotificationTemplate template = templateRepository.findByName(templateName)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + templateName));

        if (!template.getIsActive()) {
            throw new IllegalStateException("Template is inactive");
        }

        String message = template.getBody();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            message = message.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .type(template.getType())
                .message(message)
                .title(template.getTitle())
                .channel(com.krishihub.notification.enums.NotificationChannel.valueOf(template.getType()))
                .status(com.krishihub.notification.enums.NotificationStatus.PENDING)
                .priority(com.krishihub.notification.enums.NotificationPriority.NORMAL)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        producerService.sendToQueue(notification);
    }

    public void retryPendingNotifications() {
        List<Notification> pendingNotifications = notificationRepository
                .findByStatus(com.krishihub.notification.enums.NotificationStatus.PENDING);
        pendingNotifications.forEach(notification -> {
            producerService.sendToQueue(notification);
        });
    }

    public org.springframework.data.domain.Page<Notification> getNotificationHistory(int page, int size) {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc(org.springframework.data.domain.PageRequest.of(page, size));
    }
}

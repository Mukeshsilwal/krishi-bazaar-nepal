package com.krishihub.notification.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.entity.NotificationTemplate;
import com.krishihub.notification.enums.NotificationChannel;
import com.krishihub.notification.enums.NotificationPriority;
import com.krishihub.notification.enums.NotificationStatus;
import com.krishihub.notification.repository.NotificationRepository;
import com.krishihub.notification.repository.NotificationTemplateRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationProducerService producerService;

    private final UserRepository userRepository;

    public Page<NotificationTemplate> getTemplates(Pageable pageable) {
        return templateRepository.findAll(pageable);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new java.util.HashMap<>();

        long totalSent = notificationRepository.countByStatus(NotificationStatus.SENT);
        long pending = notificationRepository
                .countByStatus(NotificationStatus.PENDING);
        long queued = notificationRepository.countByStatus(NotificationStatus.QUEUED);
        long failed = notificationRepository.countByStatus(NotificationStatus.FAILED);

        stats.put("totalSent", totalSent);
        stats.put("pending", pending);
        stats.put("queued", queued);

        long totalAttempts = totalSent + failed;
        double deliveryRate = totalAttempts > 0 ? ((double) totalSent / totalAttempts) * 100 : 0;

        stats.put("deliveryRate", Math.round(deliveryRate * 10.0) / 10.0);
        stats.put("activeUsers", notificationRepository.countDistinctUsers());
        stats.put("totalTargetableUsers", userRepository.count());
        stats.put("scheduled", notificationRepository.countByScheduledAtGreaterThan(com.krishihub.common.util.DateTimeProvider.now()));

        return stats;
    }

    public void sendBroadcast(String title, String message, String channel, String role, String targetValue,
            String priority) {
        
        if ("SINGLE".equalsIgnoreCase(role)) {
            User user = userRepository.findByMobileNumber(targetValue)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with mobile: " + targetValue));
            sendNotificationToUser(user, title, message, channel, priority);
            return;
        }

        int page = 0;
        int size = 100;
        Page<User> userPage;

        do {
            Pageable pageable = PageRequest.of(page, size);
            if ("ALL".equalsIgnoreCase(role)) {
                userPage = userRepository.findAll(pageable);
            } else {
                try {
                     // Try to parse role, ignore if invalid (though validation should happen upstream)
                     User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
                     userPage = userRepository.findByRole(userRole, pageable);
                } catch (IllegalArgumentException e) {
                     // Fallback or error if role is invalid. For now treating as empty.
                     userPage = Page.empty();
                }
            }

            userPage.forEach(user -> sendNotificationToUser(user, title, message, channel, priority));
            page++;
        } while (userPage.hasNext());
    }

    private void sendNotificationToUser(User user, String title, String message, String channel, String priority) {
        Notification notification = Notification.builder()
                .userId(user.getId())
                .title(title)
                .message(message)
                .type("BROADCAST")
                .channel(NotificationChannel.valueOf(channel))
                .status(NotificationStatus.PENDING)
                .priority(NotificationPriority.valueOf(priority))
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        producerService.sendToQueue(notification);
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
                .channel(NotificationChannel.valueOf(template.getType()))
                .status(NotificationStatus.PENDING)
                .priority(NotificationPriority.NORMAL)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        producerService.sendToQueue(notification);
    }

    public void retryPendingNotifications() {
        List<Notification> pendingNotifications = notificationRepository
                .findByStatus(NotificationStatus.PENDING);
        pendingNotifications.forEach(notification -> {
            producerService.sendToQueue(notification);
        });
    }

    public Page<Notification> getNotificationHistory(int page, int size) {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}

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

    public List<NotificationTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @Transactional
    public NotificationTemplate createTemplate(NotificationTemplate template) {
        return templateRepository.save(template);
    }

    @Transactional
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
                .type(template.getType()) // Reuse type from template or map it
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }
}

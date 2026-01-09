package com.krishihub.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.enums.NotificationStatus;
import com.krishihub.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducerService {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;

    private static final String NOTIFICATION_QUEUE = "notification.queue";

    public void sendToQueue(Notification notification) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("notificationId", notification.getId().toString());
            payload.put("type", notification.getType());
            // Add other necessary fields for the consumer

            String jsonMessage = objectMapper.writeValueAsString(payload);

            // In a real scheduled scenario, we might use AMQ_SCHEDULED_DELAY header
            // For now, assume immediate or external scheduler handles delay

            rabbitTemplate.convertAndSend(NOTIFICATION_QUEUE, jsonMessage);

            notification.setStatus(NotificationStatus.QUEUED);
            notificationRepository.save(notification);
            log.info("Notification {} sent to queue", notification.getId());

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize notification payload", e);
            notification.setStatus(NotificationStatus.FAILED);
            notification.setFailureReason("Serialization Error: " + e.getMessage());
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to send notification to queue", e);
            notification.setStatus(NotificationStatus.FAILED);
            notification.setFailureReason("Queue Error: " + e.getMessage());
            notificationRepository.save(notification);
        }
    }
}

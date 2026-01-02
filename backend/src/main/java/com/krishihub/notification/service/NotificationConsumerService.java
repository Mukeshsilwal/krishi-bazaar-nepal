package com.krishihub.notification.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumerService {

    private final ObjectMapper objectMapper;
    private final NotificationSenderService senderService;

    @JmsListener(destination = "notification.queue")
    public void consumeNotification(String message) {
        log.info("Received message from queue: {}", message);
        try {
            Map<String, String> payload = objectMapper.readValue(message, new TypeReference<>() {
            });
            UUID notificationId = UUID.fromString(payload.get("notificationId"));

            senderService.sendNotification(notificationId);

        } catch (Exception e) {
            log.error("Error processing notification message", e);
            // In a robust system, we would throw exception to trigger DLQ or retry
        }
    }
}

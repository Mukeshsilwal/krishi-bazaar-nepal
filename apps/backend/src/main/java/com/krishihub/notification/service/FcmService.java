package com.krishihub.notification.service;

import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FcmService {

    public void sendNotification(String deviceToken, String title, String body, Map<String, String> data) {
        try {
            Message message = Message.builder()
                .setToken(deviceToken)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putAllData(data)
                .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent FCM notification to token {}. Response: {}", deviceToken, response);
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send FCM notification to token {}: {}", deviceToken, e.getMessage());
            throw new RuntimeException("FCM send failed", e);
        }
    }

    public void sendToMultipleDevices(List<String> tokens, String title, String body, Map<String, String> data) {
        if (tokens == null || tokens.isEmpty()) return;

        try {
            MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(tokens)
                .setNotification(Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build())
                .putAllData(data)
                .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            log.info("Successfully sent multicast FCM notifications. Success count: {}, Failure count: {}", 
                response.getSuccessCount(), response.getFailureCount());
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send multicast FCM notification: {}", e.getMessage());
        }
    }
}

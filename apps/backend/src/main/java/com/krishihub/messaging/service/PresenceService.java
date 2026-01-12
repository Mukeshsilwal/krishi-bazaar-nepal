package com.krishihub.messaging.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;

    // key: mobileNumber, value: isOnline
    private final Map<String, Boolean> activeUsers = new ConcurrentHashMap<>();

    public void connectUser(String mobileNumber) {
        activeUsers.put(mobileNumber, true);
        broadcastPresence(mobileNumber, true);
        log.info("User connected: {}", mobileNumber);
    }

    public void disconnectUser(String mobileNumber) {
        activeUsers.put(mobileNumber, false);
        broadcastPresence(mobileNumber, false);
        log.info("User disconnected: {}", mobileNumber);
    }

    public boolean isUserOnline(String mobileNumber) {
        return activeUsers.getOrDefault(mobileNumber, false);
    }

    public Map<String, Boolean> getOnlineUsers() {
        return new HashMap<>(activeUsers);
    }

    private void broadcastPresence(String mobileNumber, boolean isOnline) {
        Map<String, Object> payload = Map.of(
                "userId", mobileNumber, // Using mobileNumber as ID for presence
                "status", isOnline ? "ONLINE" : "OFFLINE");
        messagingTemplate.convertAndSend("/topic/presence", payload);
    }
}

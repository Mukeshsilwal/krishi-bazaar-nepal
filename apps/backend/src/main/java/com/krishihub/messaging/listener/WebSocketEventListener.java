package com.krishihub.messaging.listener;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.messaging.service.MessagingService;
import com.krishihub.messaging.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final PresenceService presenceService;
    private final MessagingService messagingService;
    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            String mobileNumber = principal.getName();
            log.info("WebSocket Connected: {}", mobileNumber);
            
            // 1. Mark User as Online
            presenceService.connectUser(mobileNumber);

            // 2. Mark all pending messages for this user as DELIVERED
            Optional<User> userOpt = userRepository.findByMobileNumber(mobileNumber);
            if (userOpt.isPresent()) {
                try {
                    messagingService.markMessagesAsDelivered(userOpt.get().getId());
                } catch (Exception e) {
                    log.error("Error marking messages as delivered for user: {}", mobileNumber, e);
                }
            } else {
                log.warn("Connected user not found in database: {}", mobileNumber);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            String mobileNumber = principal.getName();
            log.info("WebSocket Disconnected: {}", mobileNumber);
            
            // Mark User as Offline
            presenceService.disconnectUser(mobileNumber);
        }
    }
}

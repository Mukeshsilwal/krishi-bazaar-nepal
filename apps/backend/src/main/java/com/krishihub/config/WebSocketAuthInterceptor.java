package com.krishihub.config;

import com.krishihub.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");
            
            String token = null;
            if (authorization != null && !authorization.isEmpty()) {
                String bearerToken = authorization.get(0);
                if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                    token = bearerToken.substring(7);
                }
            }

            if (token != null) {
                try {
                    String username = jwtUtil.extractUsername(token);
                    if (username != null) {
                        // We are not loading full UserDetails here for performance, 
                        // just setting the Principal Name (mobile) which logic relies on.
                        // Signature verification happens inside extractUsername/extractAllClaims via JwtUtil.
                        
                        Principal principal = new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                Collections.emptyList()
                        );
                        accessor.setUser(principal);
                        log.debug("WebSocket Authenticated User: {}", username);
                    }
                } catch (Exception e) {
                    log.error("WebSocket Token Validation Failed: {}", e.getMessage());
                    // We don't throw exception here to allow anonymous connection if logic permits, 
                    // but usually we want to block. Spring Security might block if User is null?
                    // Or we let it pass as "guest" but application logic requiring Principal will fail.
                }
            }
        }
        return message;
    }
}

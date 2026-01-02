package com.krishihub.messaging.controller;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.messaging.dto.ConversationDto;
import com.krishihub.messaging.dto.MessageDto;
import com.krishihub.messaging.dto.SendMessageRequest;
import com.krishihub.messaging.service.MessagingService;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;
    private final UserRepository userRepository;
    private final com.krishihub.messaging.service.PresenceService presenceService;

    // REST endpoints
    @PostMapping("/api/messages")
    @ResponseBody
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        UUID userId = com.krishihub.common.context.UserContextHolder.getUserId();
        MessageDto message = messagingService.sendMessage(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    @GetMapping("/api/messages/conversations")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations() {
        UUID userId = com.krishihub.common.context.UserContextHolder.getUserId();
        List<ConversationDto> conversations = messagingService.getConversations(userId);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/api/messages/{userId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<MessageDto>>> getConversation(
            @PathVariable UUID userId) {
        UUID currentUserId = com.krishihub.common.context.UserContextHolder.getUserId();
        List<MessageDto> messages = messagingService.getConversation(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/api/messages/unread/count")
    @ResponseBody
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        UUID userId = com.krishihub.common.context.UserContextHolder.getUserId();
        long count = messagingService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/api/messages/presence")
    @ResponseBody
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getOnlineUsers() {
        return ResponseEntity.ok(ApiResponse.success(presenceService.getOnlineUsers()));
    }

    @PutMapping("/api/messages/{userId}/read")
    @ResponseBody
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID userId) {
        UUID currentUserId = com.krishihub.common.context.UserContextHolder.getUserId();
        messagingService.markMessagesAsRead(currentUserId, userId);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    // WebSocket endpoint
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload SendMessageRequest request, Principal principal) {
        String senderMobile = principal.getName();
        // Resolve UUID from mobile
        User sender = userRepository.findByMobileNumber(senderMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        messagingService.sendMessage(sender.getId(), request);
    }

    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Map<String, String> payload, Principal principal) {
        String senderMobile = principal.getName();
        // Resolve UUID from mobile
        User sender = userRepository.findByMobileNumber(senderMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        messagingService.sendTypingIndicator(sender.getId(), UUID.fromString(payload.get("receiverId")));
    }
}

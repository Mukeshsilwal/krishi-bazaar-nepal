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
import org.springframework.security.core.Authentication;
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
            Authentication authentication,
            @Valid @RequestBody SendMessageRequest request) {
        String mobileNumber = authentication.getName();
        MessageDto message = messagingService.sendMessage(mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    @GetMapping("/api/messages/conversations")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations(
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        List<ConversationDto> conversations = messagingService.getConversations(mobileNumber);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/api/messages/{userId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<MessageDto>>> getConversation(
            @PathVariable UUID userId,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        List<MessageDto> messages = messagingService.getConversation(mobileNumber, userId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/api/messages/unread/count")
    @ResponseBody
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        long count = messagingService.getUnreadCount(mobileNumber);
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
            @PathVariable UUID userId,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        messagingService.markMessagesAsRead(user.getId(), userId);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    // WebSocket endpoint
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload SendMessageRequest request, Principal principal) {
        String senderMobile = principal.getName();
        messagingService.sendMessage(senderMobile, request);
    }

    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Map<String, String> payload, Principal principal) {
        // payload: { receiverId: "..." }
        // We need to send this to the specific user's queue
        // For simplicity, we assume receiverId is the mobile number or we need to look
        // it up.
        // But wait, the frontend sends UUID usually.
        // Let's assume the frontend sends the UUID of the receiver.
        // Ideally we map UUID -> MobileNumber to send to /user/{mobile}/queue/typing

        // Actually, let's keep it simple: Broadcast to /topic/typing but that's not
        // secure/private.
        // Better: SimpleMessagingTemplate convertAndSendToUser

        // Since we don't have easy UUID->Mobile mapping here without DB, let's just
        // delegate to service if needed.
        // But for now, let's assume the client subscribes to a specific conversation
        // topic or user queue.

        // Let's implement this in MessagingService for cleaner code, passing passing it
        // through.
        messagingService.sendTypingIndicator(principal.getName(), UUID.fromString(payload.get("receiverId")));
    }
}

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
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;
    private final UserRepository userRepository;

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
}

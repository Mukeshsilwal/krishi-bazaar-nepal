package com.krishihub.messaging.controller;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.common.context.UserContextHolder;
import com.krishihub.messaging.dto.ChatUserDto;
import com.krishihub.messaging.dto.ConversationDto;
import com.krishihub.messaging.dto.MessageDto;
import com.krishihub.messaging.dto.SendMessageRequest;
import com.krishihub.messaging.service.ChatUserDirectoryService;
import com.krishihub.messaging.service.FileStorageService;
import com.krishihub.messaging.service.MessagingService;
import com.krishihub.messaging.service.PresenceService;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessagingService messagingService;
    private final UserRepository userRepository;
    private final PresenceService presenceService;
    private final ChatUserDirectoryService chatUserDirectoryService;
    private final FileStorageService fileStorageService;

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationDto>>> getConversations() {
        UUID userId = UserContextHolder.getUserId();
        List<ConversationDto> conversations = messagingService.getConversations(userId);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @PostMapping("/conversation/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationDto>> createConversation(@RequestBody Map<String, String> request) {
        UUID currentUserId = UserContextHolder.getUserId();
        String receiverIdStr = request.get("receiverId");
        if (receiverIdStr == null) {
            throw new IllegalArgumentException("receiverId is required");
        }
        UUID receiverId = UUID.fromString(receiverIdStr);
        
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User otherUser = userRepository.findById(receiverId).orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        var conversation = messagingService.getOrCreateDirectConversation(currentUser, otherUser);
        
        return ResponseEntity.ok(ApiResponse.success(messagingService.getConversationById(conversation.getId(), currentUserId)));
    }
    
    @GetMapping("/presence")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getOnlineUsers() {
        return ResponseEntity.ok(ApiResponse.success(presenceService.getOnlineUsers()));
    }

    // --- Chat User Directory APIs ---

    @GetMapping("/users")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatUserDto>>> getChatUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        UUID userId = UserContextHolder.getUserId();
        List<ChatUserDto> users = chatUserDirectoryService.getChatUsers(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatUserDto>>> searchChatUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        UUID userId = UserContextHolder.getUserId();
        List<ChatUserDto> users = chatUserDirectoryService.searchChatUsers(userId, query, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/filter")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ChatUserDto>>> filterChatUsersByRole(
            @RequestParam String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        UUID userId = UserContextHolder.getUserId();
        List<ChatUserDto> users = chatUserDirectoryService.filterChatUsersByRole(userId, role, page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // --- File Upload & Download APIs ---

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("conversationId") UUID conversationId) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("FILE_EMPTY", "File is empty"));
            }

            // Validate file size (10MB limit)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("FILE_TOO_LARGE", "File size must be less than 10MB"));
            }

            // Store file
            FileStorageService.FileUploadResult result = fileStorageService.storeFile(file);

            // Return file info
            Map<String, Object> response = Map.of(
                    "fileUrl", result.getFileUrl(),
                    "fileName", result.getFileName(),
                    "fileSize", result.getFileSize(),
                    "fileType", result.getFileType()
            );

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("UPLOAD_FAILED", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = fileStorageService.loadFile(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";
                try {
                    contentType = java.nio.file.Files.probeContentType(filePath);
                } catch (Exception e) {
                    // Use default if unable to determine
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/conversation/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationDto>> getConversation(@PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success(messagingService.getConversationById(id, userId)));
    }

    // --- Message APIs ---

    @GetMapping("/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(
            @RequestParam UUID conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        UUID userId = UserContextHolder.getUserId();
        List<MessageDto> messages = messagingService.getMessages(conversationId, userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/message/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(@RequestBody SendMessageRequest request) {
        UUID userId = UserContextHolder.getUserId();
        MessageDto message = messagingService.sendMessage(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
    }

    // --- Unread APIs ---

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        UUID userId = UserContextHolder.getUserId();
        long count = messagingService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/message/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@RequestBody Map<String, String> request) {
        UUID currentUserId = UserContextHolder.getUserId();
        String conversationIdStr = request.get("conversationId");
        if (conversationIdStr != null) {
            messagingService.markConversationAsRead(currentUserId, UUID.fromString(conversationIdStr));
        }
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }
    
    // --- WebSocket Mappings ---
    
    @MessageMapping("/chat.sendMessage")
    public void sendMessageViaWebSocket(@Payload SendMessageRequest request, Principal principal) {
        String senderMobile = principal.getName();
        User sender = userRepository.findByMobileNumber(senderMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        messagingService.sendMessage(sender.getId(), request);
    }
    
    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Map<String, String> payload, Principal principal) {
        String senderMobile = principal.getName();
        User sender = userRepository.findByMobileNumber(senderMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UUID conversationId = null;
        if (payload.containsKey("conversationId")) {
            conversationId = UUID.fromString(payload.get("conversationId"));
        }
        
        UUID receiverId = null;
        if (payload.containsKey("receiverId")) {
            receiverId = UUID.fromString(payload.get("receiverId"));
        }

        if (conversationId != null || receiverId != null) {
            messagingService.sendTypingIndicator(sender.getId(), receiverId, conversationId);
        }
    }

    @MessageMapping("/chat.seen")
    public void markSeenViaWebSocket(@Payload Map<String, String> payload, Principal principal) {
        String userMobile = principal.getName();
        User reader = userRepository.findByMobileNumber(userMobile)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (payload.containsKey("conversationId")) {
            UUID conversationId = UUID.fromString(payload.get("conversationId"));
            messagingService.markConversationAsRead(reader.getId(), conversationId);
        }
    }
}

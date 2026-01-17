package com.krishihub.messaging.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.messaging.dto.ChatUserDto;
import com.krishihub.messaging.entity.Conversation;
import com.krishihub.messaging.entity.ConversationParticipant;
import com.krishihub.messaging.entity.Message;
import com.krishihub.messaging.repository.ConversationParticipantRepository;
import com.krishihub.messaging.repository.ConversationRepository;
import com.krishihub.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing Chat User Directory
 * Provides messenger-style user listing with online status, last messages, and unread counts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatUserDirectoryService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final PresenceService presenceService;

    /**
     * Get all users for chat directory with metadata
     * @param currentUserId The logged-in user ID
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return List of ChatUserDto with all metadata
     */
    public List<ChatUserDto> getChatUsers(UUID currentUserId, int page, int size) {
        // Get all active users except current user
        List<User> allUsers = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .filter(u -> u.getEnabled()) // Only active users
                .collect(Collectors.toList());

        // Get all conversations for current user
        List<Conversation> userConversations = conversationRepository.findByUserId(currentUserId);
        
        // Build conversation map for quick lookup
        Map<UUID, Conversation> conversationMap = new HashMap<>();
        for (Conversation conv : userConversations) {
            List<ConversationParticipant> participants = participantRepository.findByConversationId(conv.getId());
            for (ConversationParticipant p : participants) {
                if (!p.getUser().getId().equals(currentUserId)) {
                    conversationMap.put(p.getUser().getId(), conv);
                }
            }
        }

        // Build user DTOs
        List<ChatUserDto> chatUsers = allUsers.stream()
                .map(user -> buildChatUserDto(user, currentUserId, conversationMap))
                .collect(Collectors.toList());

        // Sort by priority: 1. Recent conversations, 2. Online users, 3. Alphabetical
        chatUsers.sort((a, b) -> {
            // Priority 1: Users with recent messages
            if (a.getLastMessageTime() != null && b.getLastMessageTime() == null) return -1;
            if (a.getLastMessageTime() == null && b.getLastMessageTime() != null) return 1;
            if (a.getLastMessageTime() != null && b.getLastMessageTime() != null) {
                int timeCompare = b.getLastMessageTime().compareTo(a.getLastMessageTime());
                if (timeCompare != 0) return timeCompare;
            }

            // Priority 2: Online users
            if (a.getOnline() && !b.getOnline()) return -1;
            if (!a.getOnline() && b.getOnline()) return 1;

            // Priority 3: Alphabetical
            return a.getName().compareToIgnoreCase(b.getName());
        });

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, chatUsers.size());
        
        if (start >= chatUsers.size()) {
            return new ArrayList<>();
        }

        return chatUsers.subList(start, end);
    }

    /**
     * Build ChatUserDto for a single user
     */
    private ChatUserDto buildChatUserDto(User user, UUID currentUserId, Map<UUID, Conversation> conversationMap) {
        Conversation conversation = conversationMap.get(user.getId());
        
        String lastMessage = null;
        Date lastMessageTime = null;
        Long unreadCount = 0L;
        UUID conversationId = null;

        if (conversation != null) {
            conversationId = conversation.getId();
            
            // Get last message
            var lastMessagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                    conversation.getId(), PageRequest.of(0, 1));
            
            if (lastMessagePage.hasContent()) {
                Message lastMsg = lastMessagePage.getContent().get(0);
                lastMessage = lastMsg.getMessage();
                lastMessageTime = lastMsg.getCreatedAt();
            }

            // Get unread count
            unreadCount = messageRepository.countUnreadMessagesByConversation(
                    conversation.getId(), currentUserId);
        }

        // Check online status
        boolean isOnline = presenceService.isUserOnline(user.getMobileNumber());

        return ChatUserDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .mobileNumber(user.getMobileNumber())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileImage(null) // TODO: Add profile image support
                .online(isOnline)
                .lastMessage(lastMessage)
                .lastMessageTime(lastMessageTime)
                .unreadCount(unreadCount)
                .lastSeen(null) // TODO: Add last seen tracking
                .conversationId(conversationId)
                .hasConversation(conversation != null)
                .build();
    }

    /**
     * Search users by name
     */
    public List<ChatUserDto> searchChatUsers(UUID currentUserId, String query, int page, int size) {
        List<ChatUserDto> allUsers = getChatUsers(currentUserId, 0, Integer.MAX_VALUE);
        
        List<ChatUserDto> filtered = allUsers.stream()
                .filter(u -> u.getName() != null && 
                        u.getName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, filtered.size());
        
        if (start >= filtered.size()) {
            return new ArrayList<>();
        }

        return filtered.subList(start, end);
    }

    /**
     * Filter users by role
     */
    public List<ChatUserDto> filterChatUsersByRole(UUID currentUserId, String role, int page, int size) {
        List<ChatUserDto> allUsers = getChatUsers(currentUserId, 0, Integer.MAX_VALUE);
        
        List<ChatUserDto> filtered = allUsers.stream()
                .filter(u -> u.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, filtered.size());
        
        if (start >= filtered.size()) {
            return new ArrayList<>();
        }

        return filtered.subList(start, end);
    }
}

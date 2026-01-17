package com.krishihub.messaging.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.messaging.dto.ConversationDto;
import com.krishihub.messaging.dto.MessageDto;
import com.krishihub.messaging.dto.SendMessageRequest;
import com.krishihub.messaging.entity.*;
import com.krishihub.messaging.repository.ConversationParticipantRepository;
import com.krishihub.messaging.repository.ConversationRepository;
import com.krishihub.messaging.repository.MessageRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagingService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final CropListingRepository listingRepository;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MessageDto sendMessage(UUID senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        Conversation conversation;

        // If conversationId is provided, use it
        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
            
            // Validate participation
            if (!participantRepository.existsByConversationIdAndUserId(conversation.getId(), senderId)) {
                throw new BadRequestException("You are not a participant of this conversation");
            }

        } else if (request.getReceiverId() != null) {
            // Find or create direct conversation
            User receiver = userRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

            if (sender.getId().equals(receiver.getId())) {
                throw new BadRequestException("Cannot send message to yourself");
            }
            conversation = getOrCreateDirectConversation(sender, receiver);
        } else {
            throw new BadRequestException("Either conversationId or receiverId must be provided");
        }

        // Determine Receiver (For Direct Chat legacy support fields)
        User receiverUser = null;
        if (conversation.getType() == ConversationType.DIRECT) {
             List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
             receiverUser = participants.stream()
                     .filter(p -> !p.getUser().getId().equals(senderId))
                     .map(ConversationParticipant::getUser)
                     .findFirst()
                     .orElse(null);
        }

        CropListing listing = null;
        if (request.getListingId() != null) {
            listing = listingRepository.findById(request.getListingId())
                    .orElse(null);
        }

        final User finalReceiver = receiverUser;
        boolean isDelivered = false;

        // Check if receiver is online to mark as DELIVERED immediately
        if (finalReceiver != null && presenceService.isUserOnline(finalReceiver.getMobileNumber())) {
            isDelivered = true;
        }

        // Determine type
        com.krishihub.messaging.entity.MessageType messageType = com.krishihub.messaging.entity.MessageType.TEXT;
        if (request.getType() != null) {
            try {
                messageType = com.krishihub.messaging.entity.MessageType.valueOf(request.getType());
            } catch (IllegalArgumentException e) {
                // Default to TEXT
            }
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiverUser)
                .listing(listing)
                .message(request.getMessage())
                .type(messageType)
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .fileType(request.getFileType())
                .isRead(false)
                .status(isDelivered ? com.krishihub.messaging.enums.MessageStatus.DELIVERED : com.krishihub.messaging.enums.MessageStatus.SENT)
                .deliveredAt(isDelivered ? new Date() : null)
                .build();

        Message savedMessage = messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(new Date());
        conversationRepository.save(conversation);

        MessageDto messageDto = MessageDto.fromEntity(savedMessage);

        // Notify participants
        notifyParticipants(conversation, messageDto, senderId);

        return messageDto;
    }

    private void notifyParticipants(Conversation conversation, MessageDto messageDto, UUID senderId) {
        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
        
        for (ConversationParticipant participant : participants) {
            if (!participant.getUser().getId().equals(senderId)) {
                // To Receiver
                messagingTemplate.convertAndSendToUser(
                        participant.getUser().getMobileNumber(),
                        "/queue/messages",
                        messageDto);
                
                // If we marked it as Delivered, notify Sender too about the status update
                if (messageDto.getStatus().equals("DELIVERED")) {
                     notifyStatusChange(senderId, messageDto.getId(), "DELIVERED");
                }
            }
        }
    }

    // Notify user about a message status change (e.g. your message was read by X)
    private void notifyStatusChange(UUID targetUserId, UUID messageId, String status) {
        User target = userRepository.findById(targetUserId).orElse(null);
        if (target != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "STATUS_UPDATE");
            payload.put("messageId", messageId);
            payload.put("status", status);
            payload.put("timestamp", new Date());

            messagingTemplate.convertAndSendToUser(
                    target.getMobileNumber(),
                    "/queue/status",
                    payload);
        }
    }

    @Transactional
    public Conversation getOrCreateDirectConversation(User user1, User user2) {
        return conversationRepository.findDirectConversation(user1.getId(), user2.getId())
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .type(ConversationType.DIRECT)
                            .status(ConversationStatus.ACTIVE)
                            .lastMessageAt(new Date())
                            .build();
                    
                    Conversation savedConv = conversationRepository.save(newConv);

                    ConversationParticipant p1 = ConversationParticipant.builder()
                            .conversation(savedConv)
                            .user(user1)
                            .role("MEMBER")
                            .build();
                    
                    ConversationParticipant p2 = ConversationParticipant.builder()
                            .conversation(savedConv)
                            .user(user2)
                            .role("MEMBER")
                            .build();

                    participantRepository.saveAll(Arrays.asList(p1, p2));
                    return savedConv;
                });
    }

    /**
     * Get list of conversations for current user
     */
    public List<ConversationDto> getConversations(UUID userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        
        // Default Support Chat Logic: If user has no conversations, check if they need a welcome support chat
        if (conversations.isEmpty()) {
            User currentUser = userRepository.findById(userId).orElse(null);
            // Only auto-create for non-admin users (Farmers, etc)
            if (currentUser != null && currentUser.getRole() != User.UserRole.ADMIN && currentUser.getRole() != User.UserRole.SUPER_ADMIN) {
                // Find an Admin to chat with
                Page<User> admins = userRepository.findByRole(User.UserRole.ADMIN, PageRequest.of(0, 1));
                if (admins.hasContent()) {
                    User admin = admins.getContent().get(0);
                    // Create default conversation
                    Conversation supportChat = getOrCreateDirectConversation(currentUser, admin);
                    
                    conversations = new ArrayList<>();
                    conversations.add(supportChat);
                }
            }
        }
        
        return conversations.stream().map(conversation -> {
            // Find partner info
            List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
            User partner = null;
            
            // If Direct, find the other user
            if (conversation.getType() == ConversationType.DIRECT) {
                partner = participants.stream()
                        .filter(p -> !p.getUser().getId().equals(userId))
                        .map(ConversationParticipant::getUser)
                        .findFirst()
                        .orElse(null);
            }
            
            // Get unread count
            long unread = messageRepository.countUnreadMessagesByConversation(conversation.getId(), userId);
            
            // Get last message (Content) - Optimization: Fetch top 1 message
            Page<Message> lastMessagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversation.getId(), PageRequest.of(0, 1));
            String lastMessageContent = "";
            Date lastMessageTime = conversation.getLastMessageAt();
            UUID listingId = null;

            if (lastMessagePage.hasContent()) {
                Message lastMsg = lastMessagePage.getContent().get(0);
                lastMessageContent = lastMsg.getMessage();
                lastMessageTime = lastMsg.getCreatedAt();
                if (lastMsg.getListing() != null) {
                    listingId = lastMsg.getListing().getId();
                }
            } else {
                 // Initial virtual welcome message if empty
                 if (conversation.getType() == ConversationType.DIRECT && partner != null && 
                    (partner.getRole() == User.UserRole.ADMIN || partner.getRole() == User.UserRole.SUPER_ADMIN)) {
                     lastMessageContent = "Welcome to Kisan Support! How can we help you?";
                 }
            }

            return ConversationDto.builder()
                    .id(conversation.getId())
                    .type(conversation.getType().name())
                    .userId(partner != null ? partner.getId() : null)
                    .userName(partner != null ? partner.getName() : "Group Chat")
                    .userMobile(partner != null ? partner.getMobileNumber() : null)
                    .listingId(listingId)
                    .lastMessage(lastMessageContent)
                    .lastMessageTime(lastMessageTime)
                    .unreadCount(unread)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<MessageDto> getMessages(UUID conversationId, UUID userId, int page, int size) {
        // Validate participant
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, userId)) {
            throw new ResourceNotFoundException("Conversation not found or access denied");
        }

        Page<Message> msgPage = messageRepository.findByConversationIdOrderByCreatedAtDesc(
                conversationId, PageRequest.of(page, size));
        
        return msgPage.getContent().stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get conversation messages with user validation.
     * @param conversationId The conversation ID
     * @param userId The user ID requesting the messages
     * @return List of messages (up to 100, newest first)
     */
    public List<MessageDto> getConversationMessages(UUID conversationId, UUID userId) {
        return getMessages(conversationId, userId, 0, 100);
    }

    public long getUnreadCount(UUID userId) {
        return messageRepository.countUnreadMessages(userId);
    }

    @Transactional
    public void markConversationAsRead(UUID userId, UUID conversationId) {
        // 1. Mark as SEEN in DB
        int updated = messageRepository.markConversationAsRead(conversationId, userId);
        
        if (updated > 0) {
            // 2. Notify other participants (Senders) that their messages were read by this user
            conversationRepository.findById(conversationId).ifPresent(conversation -> {
                 List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
                 
                 for (ConversationParticipant p : participants) {
                     // Notify everyone distinct from the reader
                     if (!p.getUser().getId().equals(userId)) {
                         Map<String, Object> payload = new HashMap<>();
                         payload.put("type", "ALL_READ");
                         payload.put("conversationId", conversationId);
                         payload.put("readByUserId", userId);
                         payload.put("timestamp", new Date());
                         
                         messagingTemplate.convertAndSendToUser(
                                 p.getUser().getMobileNumber(),
                                 "/queue/status",
                                 payload);
                     }
                 }
            });
        }
    }

    public ConversationDto getConversationById(UUID conversationId, UUID currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        
        // Validate participant
        if (!participantRepository.existsByConversationIdAndUserId(conversationId, currentUserId)) {
            throw new ResourceNotFoundException("Conversation not found or access denied");
        }

        List<ConversationParticipant> participants = participantRepository.findByConversationId(conversation.getId());
        User partner = null;

        if (conversation.getType() == ConversationType.DIRECT) {
            partner = participants.stream()
                    .filter(p -> !p.getUser().getId().equals(currentUserId))
                    .map(ConversationParticipant::getUser)
                    .findFirst()
                    .orElse(null);
        }

        long unread = messageRepository.countUnreadMessagesByConversation(conversation.getId(), currentUserId);

        // Fetch last message
        Page<Message> lastMessagePage = messageRepository.findByConversationIdOrderByCreatedAtDesc(conversation.getId(), PageRequest.of(0, 1));
        String lastMessageContent = "";
        Date lastMessageTime = conversation.getLastMessageAt();
        UUID listingId = null;

        if (lastMessagePage.hasContent()) {
            Message lastMsg = lastMessagePage.getContent().get(0);
            lastMessageContent = lastMsg.getMessage();
            lastMessageTime = lastMsg.getCreatedAt();
            if (lastMsg.getListing() != null) {
                listingId = lastMsg.getListing().getId();
            }
        }

        return ConversationDto.builder()
                .id(conversation.getId())
                .type(conversation.getType().name())
                .userId(partner != null ? partner.getId() : null)
                .userName(partner != null ? partner.getName() : "Group Chat")
                .userMobile(partner != null ? partner.getMobileNumber() : null)
                .listingId(listingId)
                .lastMessage(lastMessageContent)
                .lastMessageTime(lastMessageTime)
                .unreadCount(unread)
                .build();
    }

    public void sendTypingIndicator(UUID senderId, UUID receiverId, UUID conversationId) {
        if (conversationId != null) {
            Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation != null) {
                List<ConversationParticipant> participants = participantRepository.findByConversationId(conversationId);
                Map<String, Object> payload = new HashMap<>();
                payload.put("userId", senderId);
                payload.put("conversationId", conversationId);
                payload.put("isTyping", true);

                for (ConversationParticipant p : participants) {
                    if (!p.getUser().getId().equals(senderId)) {
                        messagingTemplate.convertAndSendToUser(
                                p.getUser().getMobileNumber(),
                                "/queue/typing",
                                payload);
                    }
                }
            }
        } else if (receiverId != null) {
            // Direct message fallback (Legacy)
            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

             Map<String, Object> payload = new HashMap<>();
             payload.put("userId", senderId);
             payload.put("isTyping", true);

             messagingTemplate.convertAndSendToUser(
                     receiver.getMobileNumber(),
                     "/queue/typing",
                     payload);
        }
    }

    @Transactional
    public void markMessagesAsDelivered(UUID userId) {
        // 1. Identify senders of pending messages
        List<UUID> senderIds = messageRepository.findSendersOfPendingMessages(userId);

        if (senderIds.isEmpty()) {
            return;
        }

        // 2. Update status in DB
        int updated = messageRepository.markMessagesAsDelivered(userId);
        log.info("Marked {} messages as DELIVERED for user {}", updated, userId);

        // 3. Notify senders
        for (UUID senderId : senderIds) {
             Map<String, Object> payload = new HashMap<>();
             payload.put("type", "ALL_DELIVERED");
             payload.put("receiverId", userId);
             payload.put("status", "DELIVERED");
             payload.put("timestamp", new Date());

             User sender = userRepository.findById(senderId).orElse(null);
             if (sender != null) {
                 messagingTemplate.convertAndSendToUser(
                         sender.getMobileNumber(),
                         "/queue/status",
                         payload);
             }
        }
    }
}

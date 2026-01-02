package com.krishihub.messaging.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.messaging.dto.ConversationDto;
import com.krishihub.messaging.dto.MessageDto;
import com.krishihub.messaging.dto.SendMessageRequest;
import com.krishihub.messaging.entity.Message;
import com.krishihub.messaging.repository.MessageRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        private final UserRepository userRepository;
        private final CropListingRepository listingRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public MessageDto sendMessage(UUID senderId, SendMessageRequest request) {
                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

                User receiver = userRepository.findById(request.getReceiverId())
                                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

                // Prevent sending message to self
                if (sender.getId().equals(receiver.getId())) {
                        throw new BadRequestException("Cannot send message to yourself");
                }

                CropListing listing = null;
                if (request.getListingId() != null) {
                        listing = listingRepository.findById(request.getListingId())
                                        .orElse(null);
                }

                Message message = Message.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .listing(listing)
                                .message(request.getMessage())
                                .isRead(false)
                                .build();

                Message savedMessage = messageRepository.save(message);

                // Send real-time notification via WebSocket
                MessageDto messageDto = MessageDto.fromEntity(savedMessage);
                messagingTemplate.convertAndSendToUser(
                                receiver.getMobileNumber(),
                                "/queue/messages",
                                messageDto);

                log.info("Message sent from {} to {}", senderId, receiver.getMobileNumber());

                return messageDto;
        }

        public List<MessageDto> getConversation(UUID userId, UUID otherUserId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                User otherUser = userRepository.findById(otherUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Other user not found"));

                List<Message> messages = messageRepository.findConversationBetween(
                                user.getId(), otherUser.getId());

                // Mark messages as read
                markMessagesAsRead(user.getId(), otherUser.getId());

                return messages.stream()
                                .map(MessageDto::fromEntity)
                                .collect(Collectors.toList());
        }

        public List<ConversationDto> getConversations(UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<Message> allMessages = messageRepository.findConversations(
                                user.getId(),
                                org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

                // Group by conversation partner
                Map<UUID, List<Message>> conversationMap = new HashMap<>();
                for (Message msg : allMessages) {
                        UUID partnerId = msg.getSender().getId().equals(user.getId()) ? msg.getReceiver().getId()
                                        : msg.getSender().getId();

                        conversationMap.computeIfAbsent(partnerId, k -> new ArrayList<>()).add(msg);
                }

                // Build conversation DTOs
                return conversationMap.entrySet().stream()
                                .map(entry -> {
                                        List<Message> msgs = entry.getValue();
                                        Message lastMsg = msgs.get(0); // Already sorted by createdAt DESC

                                        User partner = lastMsg.getSender().getId().equals(user.getId())
                                                        ? lastMsg.getReceiver()
                                                        : lastMsg.getSender();

                                        long unreadCount = msgs.stream()
                                                        .filter(m -> m.getReceiver().getId().equals(user.getId())
                                                                        && !m.getIsRead())
                                                        .count();

                                        return ConversationDto.builder()
                                                        .userId(partner.getId())
                                                        .userName(partner.getName())
                                                        .userMobile(partner.getMobileNumber())
                                                        .listingId(lastMsg.getListing() != null
                                                                        ? lastMsg.getListing().getId()
                                                                        : null)
                                                        .lastMessage(lastMsg.getMessage())
                                                        .lastMessageTime(lastMsg.getCreatedAt())
                                                        .unreadCount(unreadCount)
                                                        .build();
                                })
                                .sorted(Comparator.comparing(ConversationDto::getLastMessageTime).reversed())
                                .collect(Collectors.toList());
        }

        public long getUnreadCount(UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                return messageRepository.countUnreadMessages(user.getId());
        }

        @Transactional
        public void markMessagesAsRead(UUID receiverId, UUID senderId) {
                int updated = messageRepository.markAsRead(receiverId, senderId);
                if (updated > 0) {
                        log.info("Marked {} messages as read", updated);

                        // Notify the sender (senderId) that their messages were read by receiver
                        // (receiverId)
                        User sender = userRepository.findById(senderId).orElse(null);
                        User receiver = userRepository.findById(receiverId).orElse(null);

                        if (sender != null && receiver != null) {
                                Map<String, Object> payload = new HashMap<>();
                                payload.put("userId", receiver.getId()); // The user who read the messages
                                payload.put("readAt", new Date());

                                messagingTemplate.convertAndSendToUser(
                                                sender.getMobileNumber(),
                                                "/queue/read",
                                                payload);
                        }
                }
        }

        public void sendTypingIndicator(UUID senderId, UUID receiverId) {
                User receiver = userRepository.findById(receiverId)
                                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

                Map<String, Object> payload = new HashMap<>();

                // Find sender UUID
                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

                payload.put("senderId", sender.getMobileNumber()); // Kept for backward compatibility if needed
                payload.put("userId", sender.getId());
                payload.put("isTyping", true);

                messagingTemplate.convertAndSendToUser(
                                receiver.getMobileNumber(),
                                "/queue/typing",
                                payload);
        }
}

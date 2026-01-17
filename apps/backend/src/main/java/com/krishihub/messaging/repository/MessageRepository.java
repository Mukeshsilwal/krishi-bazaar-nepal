package com.krishihub.messaging.repository;

import com.krishihub.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    Page<Message> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m JOIN ConversationParticipant cp ON m.conversation.id = cp.conversation.id WHERE cp.user.id = :userId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessagesByConversation(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.status = 'SEEN', m.seenAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.receiver.id = :userId AND m.isRead = false")
    int markConversationAsRead(@Param("conversationId") UUID conversationId, @Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Message m SET m.status = 'DELIVERED', m.deliveredAt = CURRENT_TIMESTAMP WHERE m.receiver.id = :userId AND m.status = 'SENT'")
    int markMessagesAsDelivered(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT m.sender.id FROM Message m WHERE m.receiver.id = :userId AND m.status = 'SENT'")
    java.util.List<UUID> findSendersOfPendingMessages(@Param("userId") UUID userId);
}

package com.krishihub.messaging.repository;

import com.krishihub.messaging.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c JOIN ConversationParticipant cp ON c.id = cp.conversation.id WHERE cp.user.id = :userId ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c JOIN ConversationParticipant cp1 ON c.id = cp1.conversation.id JOIN ConversationParticipant cp2 ON c.id = cp2.conversation.id WHERE cp1.user.id = :user1Id AND cp2.user.id = :user2Id AND c.type = 'DIRECT'")
    Optional<Conversation> findDirectConversation(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);
}

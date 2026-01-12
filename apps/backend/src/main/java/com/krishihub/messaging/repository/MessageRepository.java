package com.krishihub.messaging.repository;

import com.krishihub.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.id = :userId OR m.receiver.id = :userId) " +
            "ORDER BY m.createdAt DESC")
    Page<Message> findConversations(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender.id = :user1 AND m.receiver.id = :user2) OR " +
            "(m.sender.id = :user2 AND m.receiver.id = :user1) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversationBetween(@Param("user1") UUID user1, @Param("user2") UUID user2);

    @Query("SELECT m FROM Message m WHERE " +
            "m.listing.id = :listingId AND " +
            "((m.sender.id = :user1 AND m.receiver.id = :user2) OR " +
            "(m.sender.id = :user2 AND m.receiver.id = :user1)) " +
            "ORDER BY m.createdAt ASC")
    List<Message> findConversationAboutListing(
            @Param("listingId") UUID listingId,
            @Param("user1") UUID user1,
            @Param("user2") UUID user2);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE " +
            "m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.isRead = false")
    int markAsRead(@Param("receiverId") UUID receiverId, @Param("senderId") UUID senderId);
}

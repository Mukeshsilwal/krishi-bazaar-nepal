package com.krishihub.notification.repository;

import com.krishihub.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByStatus(com.krishihub.notification.enums.NotificationStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT n.userId) FROM Notification n")
    long countDistinctUsers();

    long countByScheduledAtGreaterThan(java.time.LocalDateTime date);

    List<Notification> findByStatus(com.krishihub.notification.enums.NotificationStatus status);

    org.springframework.data.domain.Page<Notification> findAllByOrderByCreatedAtDesc(
            org.springframework.data.domain.Pageable pageable);
}

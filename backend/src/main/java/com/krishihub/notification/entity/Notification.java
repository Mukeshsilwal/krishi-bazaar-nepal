package com.krishihub.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String type; // ORDER_UPDATE, PRICE_ALERT, SYSTEM

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "title")
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.krishihub.notification.enums.NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.krishihub.notification.enums.NotificationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.krishihub.notification.enums.NotificationPriority priority;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "target_metadata", columnDefinition = "TEXT")
    private String targetMetadata;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private com.krishihub.auth.entity.User user;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

package com.krishihub.notification.entity;

import com.krishihub.auth.entity.User;
import com.krishihub.notification.enums.NotificationChannel;
import com.krishihub.notification.enums.NotificationPriority;
import com.krishihub.notification.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.Date;
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
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationPriority priority;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "scheduled_at")
    private Date scheduledAt;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "sent_at")
    private Date sentAt;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "target_metadata", columnDefinition = "TEXT")
    private String targetMetadata;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;
}

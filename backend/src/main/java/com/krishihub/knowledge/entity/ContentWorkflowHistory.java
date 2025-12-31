package com.krishihub.knowledge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_workflow_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentWorkflowHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "content_type", nullable = false)
    private String contentType; // e.g., "ARTICLE"

    @Column(name = "content_id", nullable = false)
    private UUID contentId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(nullable = false)
    private String action; // "SUBMIT", "APPROVE", "REJECT", "PUBLISH"

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

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

    public static ContentWorkflowHistoryBuilder builder() {
        return new ContentWorkflowHistoryBuilder();
    }

    public static class ContentWorkflowHistoryBuilder {
        private UUID id;
        private String contentType;
        private UUID contentId;
        private UUID actorId;
        private String action;
        private String comment;
        private LocalDateTime createdAt;

        ContentWorkflowHistoryBuilder() {
        }

        public ContentWorkflowHistoryBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ContentWorkflowHistoryBuilder contentType(String contentType) {
            this.contentType = contentType;
            return this;
        }

        public ContentWorkflowHistoryBuilder contentId(UUID contentId) {
            this.contentId = contentId;
            return this;
        }

        public ContentWorkflowHistoryBuilder actorId(UUID actorId) {
            this.actorId = actorId;
            return this;
        }

        public ContentWorkflowHistoryBuilder action(String action) {
            this.action = action;
            return this;
        }

        public ContentWorkflowHistoryBuilder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public ContentWorkflowHistoryBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ContentWorkflowHistory build() {
            return new ContentWorkflowHistory(id, contentType, contentId, actorId, action, comment, createdAt);
        }
    }
}

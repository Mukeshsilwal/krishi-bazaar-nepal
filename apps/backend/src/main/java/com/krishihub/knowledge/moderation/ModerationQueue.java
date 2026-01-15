package com.krishihub.knowledge.moderation;

import com.krishihub.knowledge.ai.ProcessedKnowledge;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.util.UUID;

@Entity
@Table(name = "moderation_queue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "processed_knowledge_id", nullable = false)
    private ProcessedKnowledge processedKnowledge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationStatus status;

    private UUID assignedReviewerId;

    @Column(columnDefinition = "TEXT")
    private String reviewerComments;

    @CreationTimestamp
    @jakarta.persistence.Temporal(jakarta.persistence.TemporalType.TIMESTAMP)
    private java.util.Date createdAt;

    @UpdateTimestamp
    @jakarta.persistence.Temporal(jakarta.persistence.TemporalType.TIMESTAMP)
    private java.util.Date updatedAt;

    public enum ModerationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        NEEDS_EDIT
    }
}

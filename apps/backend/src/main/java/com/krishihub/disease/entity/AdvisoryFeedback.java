package com.krishihub.disease.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.UUID;

@Entity
@Table(name = "advisory_feedback")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisoryFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "disease_id")
    private UUID diseaseId; // Nullable if feedback is general or not linked to successful diagnosis

    @Column(name = "query_text", columnDefinition = "TEXT")
    private String queryText;

    @Column(name = "is_helpful", nullable = false)
    private boolean isHelpful;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;
}

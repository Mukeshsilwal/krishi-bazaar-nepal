package com.krishihub.diagnosis.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.diagnosis.enums.DiagnosisInputType;
import com.krishihub.diagnosis.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp; // Correct import for UpdateTimestamp
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "ai_diagnoses", indexes = {
        @Index(name = "idx_review_status", columnList = "review_status"),
        @Index(name = "idx_aid_farmer_id", columnList = "farmer_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE ai_diagnoses SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
public class AIDiagnosis {

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(name = "crop_type", nullable = false)
    private String cropType;

    @Column(name = "growth_stage")
    private String growthStage;

    @Column(name = "district")
    private String district;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type", nullable = false)
    private DiagnosisInputType inputType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_references", columnDefinition = "jsonb")
    private JsonNode inputReferences; // e.g., { "imageUrl": "..." }

    @Column(name = "ai_model_version")
    private String aiModelVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_predictions", columnDefinition = "jsonb")
    private JsonNode aiPredictions; // List of predictions

    @Column(name = "ai_explanation", columnDefinition = "TEXT")
    private String aiExplanation;

    @Column(name = "ai_severity")
    private String aiSeverity; // LOW, MEDIUM, HIGH

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", nullable = false)
    private ReviewStatus reviewStatus;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "final_diagnosis")
    private String finalDiagnosis;

    @Column(name = "linked_advisory_id")
    private UUID linkedAdvisoryId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

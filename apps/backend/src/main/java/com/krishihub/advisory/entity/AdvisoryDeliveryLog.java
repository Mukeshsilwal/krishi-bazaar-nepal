package com.krishihub.advisory.entity;

import com.krishihub.advisory.enums.AdvisoryType;
import com.krishihub.advisory.enums.DeliveryChannel;
import com.krishihub.advisory.enums.DeliveryStatus;
import com.krishihub.advisory.enums.Severity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity to track advisory delivery and farmer engagement
 */
@Entity
@Table(name = "advisory_delivery_logs", indexes = {
        @Index(name = "idx_farmer_id", columnList = "farmer_id"),
        @Index(name = "idx_rule_id", columnList = "rule_id"),
        @Index(name = "idx_advisory_type", columnList = "advisory_type"),
        @Index(name = "idx_severity", columnList = "severity"),
        @Index(name = "idx_delivery_status", columnList = "delivery_status"),
        @Index(name = "idx_district", columnList = "district"),
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_deduplication_key", columnList = "deduplication_key"),
        @Index(name = "idx_farmer_created", columnList = "farmer_id, created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisoryDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "farmer_id", nullable = false)
    private UUID farmerId;

    @Column(name = "advisory_id")
    private UUID advisoryId;

    @Column(name = "rule_id")
    private UUID ruleId;

    @Column(name = "rule_name")
    private String ruleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "advisory_type", nullable = false)
    private AdvisoryType advisoryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "weather_signal")
    private String weatherSignal;

    @Column(name = "disease_code")
    private String diseaseCode;

    @Column(name = "pest_code")
    private String pestCode;

    @Column(name = "district")
    private String district;

    @Column(name = "crop_type")
    private String cropType;

    @Column(name = "growth_stage")
    private String growthStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    private DeliveryStatus deliveryStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private DeliveryChannel channel;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "deduplication_key", unique = true)
    private String deduplicationKey;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "advisory_content", columnDefinition = "TEXT")
    private String advisoryContent;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "feedback")
    private String feedback; // USEFUL, NOT_USEFUL, NO_FEEDBACK

    @Column(name = "feedback_comment")
    private String feedbackComment;

    @Column(name = "feedback_at")
    private LocalDateTime feedbackAt;

    // Additional contextual data for analytics
    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "farmer_phone")
    private String farmerPhone;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "rainfall")
    private Double rainfall;

    @Column(name = "humidity")
    private Double humidity;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "season")
    private String season;

    @Column(name = "notification_id")
    private UUID notificationId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

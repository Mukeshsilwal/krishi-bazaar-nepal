package com.krishihub.advisory.dto;

import com.krishihub.advisory.enums.AdvisoryType;
import com.krishihub.advisory.enums.DeliveryChannel;
import com.krishihub.advisory.enums.DeliveryStatus;
import com.krishihub.advisory.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Detailed advisory log DTO with full context
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryLogDetailDTO {
    // Basic info
    private UUID id;
    private UUID farmerId;
    private String farmerName;
    private String farmerPhone;

    // Advisory info
    private UUID advisoryId;
    private UUID ruleId;
    private String ruleName;
    private AdvisoryType advisoryType;
    private Severity severity;
    private String advisoryContent;

    // Context
    private String weatherSignal;
    private String diseaseCode;
    private String pestCode;
    private String district;
    private String cropType;
    private String growthStage;
    private String season;
    private String riskLevel;

    // Weather data
    private Double temperature;
    private Double rainfall;
    private Double humidity;

    // Delivery info
    private DeliveryStatus deliveryStatus;
    private DeliveryChannel channel;
    private Integer priority;
    private String failureReason;

    // Timeline
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime openedAt;
    private LocalDateTime feedbackAt;

    // Feedback
    private String feedback;
    private String feedbackComment;
}

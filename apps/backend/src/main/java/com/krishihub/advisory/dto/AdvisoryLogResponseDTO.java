package com.krishihub.advisory.dto;

import com.krishihub.advisory.enums.AdvisoryType;
import com.krishihub.advisory.enums.DeliveryChannel;
import com.krishihub.advisory.enums.DeliveryStatus;
import com.krishihub.advisory.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.UUID;

/**
 * Response DTO for advisory log list entries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryLogResponseDTO {
    private UUID id;
    private UUID farmerId;
    private String farmerName;
    private UUID ruleId;
    private String ruleName;
    private AdvisoryType advisoryType;
    private Severity severity;
    private String district;
    private String cropType;
    private DeliveryStatus deliveryStatus;
    private DeliveryChannel channel;
    private java.util.Date createdAt;
    private java.util.Date deliveredAt;
    private java.util.Date openedAt;
    private String feedback;
}

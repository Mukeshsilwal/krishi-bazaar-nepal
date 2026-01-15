package com.krishihub.advisory.dto;

import com.krishihub.advisory.enums.AdvisoryType;
import com.krishihub.advisory.enums.DeliveryStatus;
import com.krishihub.advisory.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.UUID;

/**
 * Filter criteria for advisory log queries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryLogFilterDTO {
    private AdvisoryType advisoryType;
    private Severity severity;
    private UUID ruleId;
    private String district;
    private DeliveryStatus deliveryStatus;
    private java.util.Date startDate;
    private java.util.Date endDate;
    private String cursor; // For cursor-based pagination
    private Integer limit;
}

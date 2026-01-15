package com.krishihub.advisory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.UUID;

/**
 * DTO for farmer feedback on advisories
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryFeedbackDTO {

    private UUID deliveryLogId;
    private UUID farmerId;
    private String feedback; // USEFUL, NOT_USEFUL
    private String comment;
    private java.util.Date feedbackAt;
}

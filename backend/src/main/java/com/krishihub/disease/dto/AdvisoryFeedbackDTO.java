package com.krishihub.disease.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisoryFeedbackDTO {
    private UUID userId;
    private UUID diseaseId;
    private String queryText;
    private boolean isHelpful;
    private String comments;
}

package com.krishihub.advisory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdvisoryResponse {
    private String title;
    private String snippet;
    private com.krishihub.advisory.enums.AdvisoryType type;
    private String referenceId; // UUID as string
    private String actionLabel; // e.g. "Read More", "View Alert"
}

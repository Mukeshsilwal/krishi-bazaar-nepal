package com.krishihub.advisory.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdvisoryResponse {
    private String title;
    private String snippet;
    private String type; // ARTICLE, DISEASE_ALERT, MARKET_TIP
    private String referenceId; // UUID as string
    private String actionLabel; // e.g. "Read More", "View Alert"
}

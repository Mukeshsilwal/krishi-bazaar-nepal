package com.krishihub.advisory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistrictRiskDto {
    private String district;
    private long totalAdvisories;
    private Map<String, Long> severityBreakdown;
    private List<String> topRisks;
    private LocalDateTime lastUpdated;
}

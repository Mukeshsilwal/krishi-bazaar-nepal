package com.krishihub.advisory.dto;

import com.krishihub.advisory.enums.Severity;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DistrictRiskAggregation {
    private String district;
    private long count;
    private Severity severity;
    private String title;
}

package com.krishihub.advisory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleSimulationResponse {
    private boolean triggered;
    private Map<String, Object> outcome;
    private String matchReason;
}

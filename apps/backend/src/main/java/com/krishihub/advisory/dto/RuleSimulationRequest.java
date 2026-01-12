package com.krishihub.advisory.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RuleSimulationRequest {
    private com.krishihub.advisory.model.RuleDefinition definition;
    private Map<String, Object> ruleConditions;
    private Map<String, Object> mockFarmerData;
    private java.util.UUID userId;
}

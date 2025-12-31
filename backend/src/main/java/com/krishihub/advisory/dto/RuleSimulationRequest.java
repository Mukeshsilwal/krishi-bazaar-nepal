package com.krishihub.advisory.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RuleSimulationRequest {
    private Map<String, Object> ruleConditions;
    private Map<String, Object> mockFarmerData;
}

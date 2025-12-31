package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.RuleSimulationRequest;
import com.krishihub.advisory.dto.RuleSimulationResponse;
import com.krishihub.advisory.entity.AdvisoryRule;
import com.krishihub.advisory.repository.AdvisoryRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final AdvisoryRuleRepository ruleRepository;

    public RuleSimulationResponse simulateRule(RuleSimulationRequest request) {
        Map<String, Object> conditions = request.getRuleConditions();
        Map<String, Object> data = request.getMockFarmerData();

        boolean isMatch = evaluateConditions(conditions, data);

        return RuleSimulationResponse.builder()
                .triggered(isMatch)
                .outcome(isMatch ? Map.of("priority", "HIGH", "action", "SEND_SMS") : null)
                .matchReason(isMatch ? "All conditions matched" : "Conditions mismatched")
                .build();
    }

    private boolean evaluateConditions(Map<String, Object> conditions, Map<String, Object> data) {
        if (conditions == null || conditions.isEmpty())
            return true;

        for (Map.Entry<String, Object> entry : conditions.entrySet()) {
            String key = entry.getKey();
            Object expectedValue = entry.getValue();
            Object actualValue = data.get(key);

            if (!Objects.equals(expectedValue, actualValue)) {
                // Simple equality check for now. Enhance with operators (>, <, IN) later.
                return false;
            }
        }
        return true;
    }
}

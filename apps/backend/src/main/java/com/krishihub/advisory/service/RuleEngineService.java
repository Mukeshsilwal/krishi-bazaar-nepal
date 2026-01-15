package com.krishihub.advisory.service;

import com.krishihub.advisory.dto.RuleSimulationRequest;
import com.krishihub.advisory.dto.RuleSimulationResponse;
import com.krishihub.advisory.entity.AdvisoryRule;
import com.krishihub.advisory.repository.AdvisoryRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final AdvisoryRuleRepository ruleRepository;
    private final com.krishihub.auth.repository.UserRepository userRepository;
    private final com.krishihub.marketplace.repository.CropListingRepository cropListingRepository;

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "activeRules", allEntries = true)
    public com.krishihub.advisory.dto.RuleDTO createRule(com.krishihub.advisory.dto.RuleDTO ruleDTO) {
        AdvisoryRule rule = AdvisoryRule.builder()
                .name(ruleDTO.getName())
                .definition(ruleDTO.getDefinition())
                .status(ruleDTO.getStatus())
                .isActive(ruleDTO.isActive())
                .version(1)
                .priority(ruleDTO.getPriority())
                .effectiveFrom(ruleDTO.getEffectiveFrom())
                .effectiveTo(ruleDTO.getEffectiveTo())
                .createdBy(ruleDTO.getCreatedBy())
                .build();

        AdvisoryRule saved = ruleRepository.save(rule);
        saved.setRuleGroupId(saved.getId()); // Initial rule is its own group
        ruleRepository.save(saved);

        return mapToDTO(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "activeRules", allEntries = true)
    public com.krishihub.advisory.dto.RuleDTO updateRule(java.util.UUID id,
            com.krishihub.advisory.dto.RuleDTO ruleDTO) {
        AdvisoryRule existing = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        // Archive existing
        existing.setStatus("ARCHIVED");
        existing.setActive(false);
        ruleRepository.save(existing);

        // Create new version
        AdvisoryRule newVersion = AdvisoryRule.builder()
                .name(ruleDTO.getName())
                .definition(ruleDTO.getDefinition())
                .status(ruleDTO.getStatus())
                .isActive(ruleDTO.isActive())
                .version(existing.getVersion() + 1)
                .ruleGroupId(existing.getRuleGroupId())
                .priority(ruleDTO.getPriority())
                .effectiveFrom(ruleDTO.getEffectiveFrom())
                .effectiveTo(ruleDTO.getEffectiveTo())
                .createdBy(ruleDTO.getCreatedBy())
                .build();

        AdvisoryRule saved = ruleRepository.save(newVersion);
        return mapToDTO(saved);
    }

    public java.util.List<com.krishihub.advisory.dto.RuleDTO> getAllRules() {
        return ruleRepository.findAll().stream().map(this::mapToDTO).collect(java.util.stream.Collectors.toList());
    }

    public long getRuleCount() {
        return ruleRepository.count();
    }

    private com.krishihub.advisory.dto.RuleDTO mapToDTO(AdvisoryRule rule) {
        return com.krishihub.advisory.dto.RuleDTO.builder()
                .id(rule.getId())
                .name(rule.getName())
                .definition(rule.getDefinition())
                .status(rule.getStatus())
                .isActive(rule.isActive())
                .version(rule.getVersion())
                .priority(rule.getPriority())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .createdBy(rule.getCreatedBy())
                .build();
    }

    public java.util.List<com.krishihub.advisory.model.RuleResult> executeRules(Map<String, Object> context) {
        java.util.List<AdvisoryRule> activeRules = ruleRepository.findByIsActiveTrueAndStatus("ACTIVE");
        java.util.List<com.krishihub.advisory.model.RuleResult> results = new java.util.ArrayList<>();

        for (AdvisoryRule rule : activeRules) {
            boolean isMatch = evaluateDefinition(rule.getDefinition(), context);

            if (isMatch) {
                results.add(com.krishihub.advisory.model.RuleResult.builder()
                        .ruleId(rule.getId())
                        .ruleName(rule.getName())
                        .triggered(true)
                        .actions(rule.getDefinition().getActions())
                        .matchReason("Conditions met")
                        .executedAt(new Date())
                        .build());
            }
        }
        return results;
    }

    public RuleSimulationResponse simulateRule(RuleSimulationRequest request) {
        // simulation now uses the provided conditions as a temporary rule to test
        // against data

        com.krishihub.advisory.model.RuleDefinition tempDefinition;

        if (request.getDefinition() != null) {
            tempDefinition = request.getDefinition();
        } else {
            tempDefinition = com.krishihub.advisory.model.RuleDefinition
                    .builder()
                    .conditions(mapToConditions(request.getRuleConditions()))
                    .logic("AND") // Default
                    .build();
        }

        Map<String, Object> contextData = request.getMockFarmerData();

        if (request.getUserId() != null) {
            com.krishihub.auth.entity.User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found for simulation"));

            contextData = new java.util.HashMap<>();
            contextData.put("user_id", user.getId().toString());
            contextData.put("district", user.getDistrict());
            contextData.put("role", user.getRole().toString());
            contextData.put("verified", user.getVerified());
            if (user.getLandSize() != null) {
                contextData.put("land_size", user.getLandSize());
            }

            java.util.List<String> userCrops = cropListingRepository
                    .findDistinctCropNamesByFarmerId(request.getUserId());
            if (!userCrops.isEmpty()) {
                contextData.put("crops", userCrops);
            }
        }

        boolean isMatch = evaluateDefinition(tempDefinition, contextData);

        return RuleSimulationResponse.builder()
                .triggered(isMatch)
                .outcome(isMatch ? Map.of("priority", "HIGH", "action", "SEND_SMS") : null) // Mock outcome for
                                                                                            // simulation
                .matchReason(isMatch ? "All conditions matched" : "Conditions mismatched")
                .build();
    }

    // Core Evaluation Logic
    public boolean evaluateDefinition(com.krishihub.advisory.model.RuleDefinition definition,
            Map<String, Object> context) {
        if (definition == null || definition.getConditions() == null || definition.getConditions().isEmpty()) {
            return true;
        }

        boolean result = "OR".equalsIgnoreCase(definition.getLogic()) ? false : true;

        for (com.krishihub.advisory.model.RuleCondition condition : definition.getConditions()) {
            boolean conditionMet = checkCondition(condition, context);

            if ("OR".equalsIgnoreCase(definition.getLogic())) {
                result = result || conditionMet;
                if (result)
                    break; // Short-circuit OR
            } else { // AND
                result = result && conditionMet;
                if (!result)
                    break; // Short-circuit AND
            }
        }
        return result;
    }

    private boolean checkCondition(com.krishihub.advisory.model.RuleCondition condition, Map<String, Object> context) {
        String field = condition.getField();
        Object actualValue = context.get(field);
        Object expectedValue = condition.getValue();
        String operator = condition.getOperator() != null ? condition.getOperator().toUpperCase() : "EQUALS";

        if (actualValue == null)
            return false; // Fail safe for missing data

        switch (operator) {
            case "EQUALS":
                return Objects.equals(actualValue.toString(), expectedValue.toString());
            case "GT": // Greater Than
                return compare(actualValue, expectedValue) > 0;
            case "LT": // Less Than
                return compare(actualValue, expectedValue) < 0;
            case "GTE": // Greater Than Equals
                return compare(actualValue, expectedValue) >= 0;
            case "LTE": // Less Than Equals
                return compare(actualValue, expectedValue) <= 0;
            case "IN":
                return expectedValue.toString().contains(actualValue.toString()); // Simple string contains for now,
                                                                                  // ideally List check
            case "CONTAINS":
                return actualValue.toString().contains(expectedValue.toString());
            default:
                return false;
        }
    }

    private int compare(Object v1, Object v2) {
        try {
            double d1 = Double.parseDouble(v1.toString());
            double d2 = Double.parseDouble(v2.toString());
            return Double.compare(d1, d2);
        } catch (NumberFormatException e) {
            return v1.toString().compareTo(v2.toString());
        }
    }

    // Helper to map old map-based conditions to new RuleCondition list for
    // simulation
    private java.util.List<com.krishihub.advisory.model.RuleCondition> mapToConditions(
            Map<String, Object> conditionMap) {
        if (conditionMap == null)
            return java.util.Collections.emptyList();

        java.util.List<com.krishihub.advisory.model.RuleCondition> list = new java.util.ArrayList<>();
        conditionMap.forEach((k, v) -> {
            list.add(com.krishihub.advisory.model.RuleCondition.builder()
                    .field(k)
                    .operator("EQUALS")
                    .value(v)
                    .build());
        });
        return list;
    }
}

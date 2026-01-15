package com.krishihub.advisory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleResult {
    private UUID ruleId;
    private String ruleName;
    private boolean triggered;
    private List<RuleAction> actions;
    private String matchReason;
    private java.util.Date executedAt;
}

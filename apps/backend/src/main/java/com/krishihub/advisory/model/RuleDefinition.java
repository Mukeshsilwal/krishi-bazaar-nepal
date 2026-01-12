package com.krishihub.advisory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleDefinition {
    private List<RuleCondition> conditions;
    private List<RuleAction> actions;
    // Logical operator for conditions (AND/OR). Default is AND.
    @Builder.Default
    private String logic = "AND";
}

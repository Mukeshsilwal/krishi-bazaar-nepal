package com.krishihub.advisory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleCondition {
    private String field;
    private String operator; // EQUALS, GT, LT, IN, CONTAINS
    private Object value;
}

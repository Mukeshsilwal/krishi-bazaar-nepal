package com.krishihub.advisory.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleAction {
    private String type; // e.g., SEND_NOTIFICATION, CREATE_ALERT
    private Map<String, Object> payload;
}

package com.krishihub.advisory.dto;

import com.krishihub.advisory.model.RuleDefinition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleDTO {
    private UUID id;
    private String name;
    private RuleDefinition definition;
    private String status;
    private boolean isActive;
    private Integer version;
    private Integer priority;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private UUID createdBy; // In real app, get from Security Context
}

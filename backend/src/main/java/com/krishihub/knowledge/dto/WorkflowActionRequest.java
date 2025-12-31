package com.krishihub.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkflowActionRequest {
    @NotBlank
    private String action; // "SUBMIT", "APPROVE", "REJECT", "PUBLISH"

    private String comment;
}

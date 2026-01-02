package com.krishihub.diagnosis.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.diagnosis.enums.DiagnosisInputType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIDiagnosisSubmissionRequest {
    private UUID farmerId;
    private String cropType;
    private String growthStage;
    private String district;
    private DiagnosisInputType inputType;
    private JsonNode inputReferences;
    private String aiModelVersion;
    private JsonNode aiPredictions;
    private String aiExplanation;
    private String aiSeverity;
}

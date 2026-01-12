package com.krishihub.diagnosis.dto;

import com.krishihub.diagnosis.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDiagnosisRequest {
    private ReviewStatus status; // APPROVED, CORRECTED, REJECTED
    private String finalDiagnosis;
    private String reviewNotes;
    private UUID reviewedBy;
}

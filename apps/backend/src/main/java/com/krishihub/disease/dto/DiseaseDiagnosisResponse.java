package com.krishihub.disease.dto;

import com.krishihub.disease.enums.RiskLevel;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiseaseDiagnosisResponse {
    private String diseaseName;
    private RiskLevel riskLevel;
    private String symptoms;
    private List<RecommendedTreatment> treatments;
    private String safetyDisclaimer; // MANDATORY

    @Data
    @Builder
    public static class RecommendedTreatment {
        private String medicineName;
        private String type;
        private boolean isOrganic;
        private String dosage;
        private String safetyInstructions;
    }
}

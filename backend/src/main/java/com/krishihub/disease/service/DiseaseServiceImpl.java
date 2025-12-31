package com.krishihub.disease.service;

import com.krishihub.disease.dto.DiseaseDiagnosisResponse;
import com.krishihub.disease.entity.*;
import com.krishihub.disease.repository.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;
    private final PesticideRepository pesticideRepository;
    private final DiseasePesticideRecommendationRepository recommendationRepository;

    private static final String SAFETY_DISCLAIMER_EN = "This recommendation is advisory only. Consult local agriculture officers before application.";

    @Override
    public Disease createDisease(Disease disease) {
        return diseaseRepository.save(disease);
    }

    @Override
    public Pesticide createPesticide(Pesticide pesticide) {
        return pesticideRepository.save(pesticide);
    }

    @Override
    public void linkPesticideToDisease(UUID diseaseId, UUID pesticideId, String dosage, Integer interval,
            Boolean isPrimary) {
        Disease disease = diseaseRepository.findById(diseaseId).orElseThrow();
        Pesticide pesticide = pesticideRepository.findById(pesticideId).orElseThrow();

        DiseasePesticideRecommendation recommendation = DiseasePesticideRecommendation.builder()
                .disease(disease)
                .pesticide(pesticide)
                .dosagePerLiter(dosage)
                .sprayIntervalDays(interval)
                .isPrimaryRecommendation(isPrimary)
                .build();

        recommendationRepository.save(recommendation);
    }

    @Override
    public List<DiseaseDiagnosisResponse> diagnoseBySymptoms(String query) {
        List<Disease> diseases = diseaseRepository.findByNameEnContainingIgnoreCaseOrNameNeContainingIgnoreCase(query,
                query);
        return diseases.stream().map(this::mapToDiagnosisResponse).collect(Collectors.toList());
    }

    @Override
    public List<DiseaseDiagnosisResponse> getDiseasesByCrop(String cropName) {
        List<Disease> diseases = diseaseRepository.findByAffectedCrop(cropName);
        return diseases.stream().map(this::mapToDiagnosisResponse).collect(Collectors.toList());
    }

    @Override
    public DiseaseDiagnosisResponse getDiseaseDetails(UUID id) {
        Disease disease = diseaseRepository.findById(id).orElseThrow(() -> new RuntimeException("Disease not found"));
        return mapToDiagnosisResponse(disease);
    }

    private DiseaseDiagnosisResponse mapToDiagnosisResponse(Disease disease) {
        List<DiseasePesticideRecommendation> recommendations = recommendationRepository
                .findByDiseaseId(disease.getId());

        List<DiseaseDiagnosisResponse.RecommendedTreatment> treatments = recommendations.stream()
                .map(rec -> DiseaseDiagnosisResponse.RecommendedTreatment.builder()
                        .medicineName(rec.getPesticide().getNameEn())
                        .type(rec.getPesticide().getType().name())
                        .isOrganic(rec.getPesticide().getIsOrganic())
                        .dosage(rec.getDosagePerLiter())
                        .safetyInstructions(rec.getPesticide().getSafetyInstructionsEn())
                        .build())
                .collect(Collectors.toList());

        return DiseaseDiagnosisResponse.builder()
                .diseaseName(disease.getNameEn())
                .riskLevel(disease.getRiskLevel())
                .symptoms(disease.getSymptomsEn())
                .treatments(treatments)
                .safetyDisclaimer(SAFETY_DISCLAIMER_EN) // MANDATORY FIELD
                .build();
    }
}

package com.krishihub.disease.service;

import com.krishihub.disease.dto.DiseaseDiagnosisResponse;
import com.krishihub.disease.entity.Disease;
import com.krishihub.disease.entity.Pesticide;
import java.util.List;
import java.util.UUID;

public interface DiseaseService {

    // Admin
    Disease createDisease(Disease disease);

    Pesticide createPesticide(Pesticide pesticide);

    List<Pesticide> getAllPesticides();
    org.springframework.data.domain.Page<Pesticide> getAllPesticides(org.springframework.data.domain.Pageable pageable);

    List<Disease> getAllDiseases();
    org.springframework.data.domain.Page<Disease> getAllDiseases(org.springframework.data.domain.Pageable pageable);

    void linkPesticideToDisease(UUID diseaseId, UUID pesticideId, String dosage, Integer interval, Boolean isPrimary);

    // Farmer
    List<DiseaseDiagnosisResponse> diagnoseBySymptoms(String query);

    List<DiseaseDiagnosisResponse> getDiseasesByCrop(String cropName);

    DiseaseDiagnosisResponse getDiseaseDetails(UUID id);
}

package com.krishihub.disease.controller;

import com.krishihub.disease.dto.DiseaseDiagnosisResponse;
import com.krishihub.disease.entity.Disease;
import com.krishihub.disease.entity.Pesticide;
import com.krishihub.disease.service.DiseaseService;
import com.krishihub.shared.dto.ApiResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/diseases")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseService diseaseService;
    private final com.krishihub.disease.advisory.AdvisoryService advisoryService;

    // Public / Farmer Endpoints
    @GetMapping("/diagnose")
    public ResponseEntity<ApiResponse<List<DiseaseDiagnosisResponse>>> diagnose(@RequestParam String symptom) {
        return ResponseEntity.ok(ApiResponse.success(diseaseService.diagnoseBySymptoms(symptom)));
    }

    @GetMapping("/crop/{cropName}")
    public ResponseEntity<ApiResponse<List<DiseaseDiagnosisResponse>>> getByCrop(@PathVariable String cropName) {
        return ResponseEntity.ok(ApiResponse.success(diseaseService.getDiseasesByCrop(cropName)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiseaseDiagnosisResponse>> getDiseaseDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(diseaseService.getDiseaseDetails(id)));
    }

    // Admin Endpoints

    @GetMapping
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<Disease>>> getAllDiseases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nameEn,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(diseaseService.getAllDiseases(pageable))));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Disease>> createDisease(@RequestBody Disease disease) {
        return ResponseEntity.ok(ApiResponse.success("Disease created successfully", diseaseService.createDisease(disease)));
    }

    @PostMapping("/pesticides")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Pesticide>> createPesticide(@RequestBody Pesticide pesticide) {
        return ResponseEntity.ok(ApiResponse.success("Pesticide created successfully", diseaseService.createPesticide(pesticide)));
    }

    @GetMapping("/pesticides")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<Pesticide>>> getAllPesticides(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nameEn,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(diseaseService.getAllPesticides(pageable))));
    }

    @PostMapping("/{diseaseId}/link-pesticide")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Void>> linkPesticide(
            @PathVariable UUID diseaseId,
            @RequestParam UUID pesticideId,
            @RequestParam String dosage,
            @RequestParam Integer interval,
            @RequestParam(defaultValue = "false") Boolean isPrimary) {

        diseaseService.linkPesticideToDisease(diseaseId, pesticideId, dosage, interval, isPrimary);
        return ResponseEntity.ok(ApiResponse.success("Pesticide linked successfully", null));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(@RequestBody com.krishihub.disease.dto.AdvisoryFeedbackDTO feedback) {
        advisoryService.submitFeedback(feedback);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully", null));
    }
}

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
    public ResponseEntity<ApiResponse<List<Disease>>> getAllDiseases() {
        return ResponseEntity.ok(ApiResponse.success(diseaseService.getAllDiseases()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Disease>> createDisease(@RequestBody Disease disease) {
        return ResponseEntity.ok(ApiResponse.success("Disease created successfully", diseaseService.createDisease(disease)));
    }

    @PostMapping("/pesticides")
    public ResponseEntity<ApiResponse<Pesticide>> createPesticide(@RequestBody Pesticide pesticide) {
        return ResponseEntity.ok(ApiResponse.success("Pesticide created successfully", diseaseService.createPesticide(pesticide)));
    }

    @GetMapping("/pesticides")
    public ResponseEntity<ApiResponse<List<Pesticide>>> getAllPesticides() {
        return ResponseEntity.ok(ApiResponse.success(diseaseService.getAllPesticides()));
    }

    @PostMapping("/{diseaseId}/link-pesticide")
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

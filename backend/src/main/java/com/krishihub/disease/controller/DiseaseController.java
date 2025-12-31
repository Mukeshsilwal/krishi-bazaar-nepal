package com.krishihub.disease.controller;

import com.krishihub.disease.dto.DiseaseDiagnosisResponse;
import com.krishihub.disease.entity.Disease;
import com.krishihub.disease.entity.Pesticide;
import com.krishihub.disease.service.DiseaseService;
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

    // Public / Farmer Endpoints
    @GetMapping("/diagnose")
    public ResponseEntity<List<DiseaseDiagnosisResponse>> diagnose(@RequestParam String symptom) {
        return ResponseEntity.ok(diseaseService.diagnoseBySymptoms(symptom));
    }

    @GetMapping("/crop/{cropName}")
    public ResponseEntity<List<DiseaseDiagnosisResponse>> getByCrop(@PathVariable String cropName) {
        return ResponseEntity.ok(diseaseService.getDiseasesByCrop(cropName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiseaseDiagnosisResponse> getDiseaseDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(diseaseService.getDiseaseDetails(id));
    }

    // Admin Endpoints
    @PostMapping
    public ResponseEntity<Disease> createDisease(@RequestBody Disease disease) {
        return ResponseEntity.ok(diseaseService.createDisease(disease));
    }

    @PostMapping("/pesticides")
    public ResponseEntity<Pesticide> createPesticide(@RequestBody Pesticide pesticide) {
        return ResponseEntity.ok(diseaseService.createPesticide(pesticide));
    }

    @PostMapping("/{diseaseId}/link-pesticide")
    public ResponseEntity<Void> linkPesticide(
            @PathVariable UUID diseaseId,
            @RequestParam UUID pesticideId,
            @RequestParam String dosage,
            @RequestParam Integer interval,
            @RequestParam(defaultValue = "false") Boolean isPrimary) {

        diseaseService.linkPesticideToDisease(diseaseId, pesticideId, dosage, interval, isPrimary);
        return ResponseEntity.ok().build();
    }
}

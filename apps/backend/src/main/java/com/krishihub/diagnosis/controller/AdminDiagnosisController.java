package com.krishihub.diagnosis.controller;

import com.krishihub.common.context.UserContextHolder;
import com.krishihub.diagnosis.dto.ReviewDiagnosisRequest;
import com.krishihub.diagnosis.entity.AIDiagnosis;
import com.krishihub.diagnosis.service.AIDiagnosisService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/diagnosis")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiagnosisController {

    private final AIDiagnosisService diagnosisService;

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<Page<AIDiagnosis>>> getReviewQueue(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Review queue retrieved",
                diagnosisService.getReviewQueue(pageable)));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<AIDiagnosis>> reviewDiagnosis(
            @PathVariable UUID id,
            @RequestBody ReviewDiagnosisRequest request) {

        UUID reviewerId = UserContextHolder.getUserId();
        request.setReviewedBy(reviewerId);

        return ResponseEntity.ok(ApiResponse.success("Diagnosis reviewed",
                diagnosisService.reviewDiagnosis(id, request)));
    }
}

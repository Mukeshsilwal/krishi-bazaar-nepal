package com.krishihub.diagnosis.controller;

import com.krishihub.diagnosis.dto.AIDiagnosisSubmissionRequest;
import com.krishihub.diagnosis.dto.ReviewDiagnosisRequest;
import com.krishihub.diagnosis.entity.AIDiagnosis;
import com.krishihub.diagnosis.service.AIDiagnosisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.krishihub.common.context.UserContextHolder;
import com.krishihub.auth.entity.User.UserRole;

@RestController
@RequestMapping("/api/diagnoses")
@RequiredArgsConstructor
public class AIDiagnosisController {

    private final AIDiagnosisService service;

    // Farmer Endpoints

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AIDiagnosis> submitDiagnosis(
            @RequestBody AIDiagnosisSubmissionRequest request) {
        // Enforce farmer ID from session
        UUID userId = UserContextHolder.getUserId();
        request.setFarmerId(userId);
        return ResponseEntity.ok(service.submitDiagnosis(request));
    }

    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<AIDiagnosis>> getHistory(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(service.getFarmerHistory(userId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AIDiagnosis> getDiagnosis(@PathVariable UUID id) {
        AIDiagnosis diagnosis = service.getDiagnosis(id);
        UUID userId = UserContextHolder.getUserId();
        UserRole userRole = UserContextHolder.getUserType();

        // Security check: Only owner or admin/expert can view
        if (!diagnosis.getFarmerId().equals(userId) &&
                userRole != UserRole.ADMIN &&
                userRole != UserRole.EXPERT) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(diagnosis);
    }

    // Admin/Expert Endpoints

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXPERT')")
    public ResponseEntity<Page<AIDiagnosis>> getReviewQueue(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(service.getReviewQueue(pageable));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'EXPERT')")
    public ResponseEntity<AIDiagnosis> reviewDiagnosis(
            @PathVariable UUID id,
            @RequestBody ReviewDiagnosisRequest request) {
        // Enforce reviewer ID
        UUID userId = UserContextHolder.getUserId();
        request.setReviewedBy(userId);
        return ResponseEntity.ok(service.reviewDiagnosis(id, request));
    }
}

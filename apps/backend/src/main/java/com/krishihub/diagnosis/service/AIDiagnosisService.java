package com.krishihub.diagnosis.service;

import com.krishihub.diagnosis.dto.AIDiagnosisSubmissionRequest;
import com.krishihub.diagnosis.dto.ReviewDiagnosisRequest;
import com.krishihub.diagnosis.entity.AIDiagnosis;
import com.krishihub.diagnosis.enums.ReviewStatus;
import com.krishihub.diagnosis.repository.AIDiagnosisRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIDiagnosisService {

    private final AIDiagnosisRepository repository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AIDiagnosis submitDiagnosis(AIDiagnosisSubmissionRequest request) {
        ReviewStatus initialStatus = ReviewStatus.PENDING;

        // Auto-flag low confidence or explicit severity
        if ("LOW".equalsIgnoreCase(request.getAiSeverity())
                || "LOW_CONFIDENCE".equalsIgnoreCase(request.getAiSeverity())) {
            initialStatus = ReviewStatus.FLAGGED_FOR_EXPERT;
        }

        AIDiagnosis diagnosis = AIDiagnosis.builder()
                .farmerId(request.getFarmerId())
                .cropType(request.getCropType())
                .growthStage(request.getGrowthStage())
                .district(request.getDistrict())
                .inputType(request.getInputType())
                .inputReferences(request.getInputReferences())
                .aiModelVersion(request.getAiModelVersion())
                .aiPredictions(request.getAiPredictions())
                .aiExplanation(request.getAiExplanation())
                .aiSeverity(request.getAiSeverity())
                .reviewStatus(initialStatus)
                .build();

        return repository.save(diagnosis);
    }

    public Page<AIDiagnosis> getReviewQueue(Pageable pageable) {
        return repository.findByReviewStatusIn(
                Arrays.asList(ReviewStatus.PENDING, ReviewStatus.FLAGGED_FOR_EXPERT),
                pageable);
    }

    public Page<AIDiagnosis> getFarmerHistory(UUID farmerId, Pageable pageable) {
        return repository.findByFarmerId(farmerId, pageable);
    }

    public AIDiagnosis getDiagnosis(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Diagnosis not found"));
    }

    @Transactional
    public AIDiagnosis reviewDiagnosis(UUID id, ReviewDiagnosisRequest request) {
        AIDiagnosis diagnosis = getDiagnosis(id);

        if (diagnosis.getReviewStatus() == ReviewStatus.APPROVED ||
                diagnosis.getReviewStatus() == ReviewStatus.REJECTED ||
                diagnosis.getReviewStatus() == ReviewStatus.CORRECTED) {
            throw new RuntimeException("Diagnosis already reviewed and finalized");
        }

        diagnosis.setReviewStatus(request.getStatus());
        diagnosis.setReviewedBy(request.getReviewedBy());
        diagnosis.setReviewNotes(request.getReviewNotes());
        diagnosis.setReviewedAt(com.krishihub.common.util.DateTimeProvider.now());

        if (request.getStatus() == ReviewStatus.APPROVED) {
            diagnosis.setFinalDiagnosis(
                    request.getFinalDiagnosis() != null ? request.getFinalDiagnosis() : "AI_APPROVED");
            eventPublisher.publishEvent(new DiagnosisApprovedEvent(this, diagnosis));
        } else if (request.getStatus() == ReviewStatus.CORRECTED) {
            diagnosis.setFinalDiagnosis(request.getFinalDiagnosis());
            eventPublisher.publishEvent(new DiagnosisApprovedEvent(this, diagnosis));
        } else if (request.getStatus() == ReviewStatus.REJECTED) {
            diagnosis.setFinalDiagnosis("REJECTED");
        }

        return repository.save(diagnosis);
    }

    // Event definition
    @Getter
    public static class DiagnosisApprovedEvent extends ApplicationEvent {
        private final AIDiagnosis diagnosis;

        public DiagnosisApprovedEvent(Object source, AIDiagnosis diagnosis) {
            super(source);
            this.diagnosis = diagnosis;
        }
    }
}

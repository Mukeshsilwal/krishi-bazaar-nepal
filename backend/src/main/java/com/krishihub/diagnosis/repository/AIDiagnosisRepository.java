package com.krishihub.diagnosis.repository;

import com.krishihub.diagnosis.entity.AIDiagnosis;
import com.krishihub.diagnosis.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AIDiagnosisRepository extends JpaRepository<AIDiagnosis, UUID> {

    Page<AIDiagnosis> findByReviewStatus(ReviewStatus reviewStatus, Pageable pageable);

    Page<AIDiagnosis> findByReviewStatusIn(java.util.Collection<ReviewStatus> statuses, Pageable pageable);

    Page<AIDiagnosis> findByFarmerId(UUID farmerId, Pageable pageable);
}

package com.krishihub.disease.repository;

import com.krishihub.disease.entity.AdvisoryFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdvisoryFeedbackRepository extends JpaRepository<AdvisoryFeedback, UUID> {
}

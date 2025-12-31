package com.krishihub.disease.repository;

import com.krishihub.disease.entity.DiseasePesticideRecommendation;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseasePesticideRecommendationRepository extends JpaRepository<DiseasePesticideRecommendation, UUID> {
    List<DiseasePesticideRecommendation> findByDiseaseId(UUID diseaseId);
}

package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface DiseaseRepository extends JpaRepository<Disease, UUID> {
    List<Disease> findByNameEnContainingIgnoreCaseOrNameNeContainingIgnoreCase(String nameEn, String nameNe);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM diseases WHERE :cropName = ANY(affected_crops)", nativeQuery = true)
    List<Disease> findByAffectedCrop(String cropName);
}

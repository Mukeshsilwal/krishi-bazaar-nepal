package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Disease;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiseaseRepository extends JpaRepository<Disease, UUID> {

    @Query(value = "SELECT * FROM diseases WHERE :crop = ANY(affected_crops)", nativeQuery = true)
    List<Disease> findByAffectedCrop(@Param("crop") String crop);

    List<Disease> findByNameEnContainingIgnoreCaseOrNameNeContainingIgnoreCase(String nameEn, String nameNe);
}

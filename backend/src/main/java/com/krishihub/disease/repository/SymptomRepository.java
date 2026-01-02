package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;

public interface SymptomRepository extends JpaRepository<Symptom, UUID> {
    Optional<Symptom> findByCode(String code);
}

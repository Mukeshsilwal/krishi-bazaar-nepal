package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Treatment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TreatmentRepository extends JpaRepository<Treatment, UUID> {
}

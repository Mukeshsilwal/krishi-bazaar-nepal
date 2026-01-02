package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Pest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PestRepository extends JpaRepository<Pest, UUID> {
}

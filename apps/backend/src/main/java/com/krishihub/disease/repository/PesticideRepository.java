package com.krishihub.disease.repository;

import com.krishihub.disease.entity.Pesticide;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PesticideRepository extends JpaRepository<Pesticide, UUID> {
}

package com.krishihub.finance.repository;

import com.krishihub.finance.entity.GovernmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GovernmentSchemeRepository extends JpaRepository<GovernmentScheme, UUID> {
    List<GovernmentScheme> findByActiveTrue();
    org.springframework.data.domain.Page<GovernmentScheme> findByActiveTrue(org.springframework.data.domain.Pageable pageable);
}

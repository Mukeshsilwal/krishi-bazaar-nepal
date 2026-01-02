package com.krishihub.advisory.repository;

import com.krishihub.advisory.entity.AdvisoryRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdvisoryRuleRepository extends JpaRepository<AdvisoryRule, UUID> {
    List<AdvisoryRule> findByStatus(String status);

    @org.springframework.cache.annotation.Cacheable("activeRules")
    List<AdvisoryRule> findByIsActiveTrueAndStatus(String status);
}

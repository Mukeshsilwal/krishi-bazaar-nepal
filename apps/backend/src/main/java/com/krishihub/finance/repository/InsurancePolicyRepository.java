package com.krishihub.finance.repository;

import com.krishihub.finance.entity.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, UUID> {
    List<InsurancePolicy> findByFarmerId(UUID farmerId);
}

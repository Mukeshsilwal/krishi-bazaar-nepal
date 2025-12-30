package com.krishihub.finance.repository;

import com.krishihub.finance.entity.Subsidy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubsidyRepository extends JpaRepository<Subsidy, UUID> {
}

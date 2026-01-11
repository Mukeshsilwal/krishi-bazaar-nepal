package com.krishihub.masterdata.repository;

import com.krishihub.masterdata.entity.MasterCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterCategoryRepository extends JpaRepository<MasterCategory, UUID> {
    Optional<MasterCategory> findByCode(String code);
}

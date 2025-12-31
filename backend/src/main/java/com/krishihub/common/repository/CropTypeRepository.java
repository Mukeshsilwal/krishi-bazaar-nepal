package com.krishihub.common.repository;

import com.krishihub.common.entity.AdministrativeUnit;
import com.krishihub.common.entity.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CropTypeRepository extends JpaRepository<CropType, UUID> {
    List<CropType> findByIsActiveTrue();
}

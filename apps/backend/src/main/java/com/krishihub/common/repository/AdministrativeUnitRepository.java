package com.krishihub.common.repository;

import com.krishihub.common.entity.AdministrativeUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdministrativeUnitRepository extends JpaRepository<AdministrativeUnit, UUID> {
    List<AdministrativeUnit> findByType(AdministrativeUnit.UnitType type);

    List<AdministrativeUnit> findByParentId(UUID parentId);
}

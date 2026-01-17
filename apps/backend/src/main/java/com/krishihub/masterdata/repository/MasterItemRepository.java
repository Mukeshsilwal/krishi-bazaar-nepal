package com.krishihub.masterdata.repository;

import com.krishihub.masterdata.entity.MasterItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MasterItemRepository extends JpaRepository<MasterItem, UUID> {

    @Query("SELECT i FROM MasterItem i WHERE i.category.code = :categoryCode " +
            "AND i.active = true " +
            "AND (i.effectiveFrom IS NULL OR i.effectiveFrom <= :currentDate) " +
            "AND (i.effectiveTo IS NULL OR i.effectiveTo >= :currentDate) " +
            "ORDER BY i.sortOrder ASC")
    List<MasterItem> findActiveItemsByCategoryCode(String categoryCode, java.util.Date currentDate);

    List<MasterItem> findByCategoryIdOrderBySortOrderAsc(UUID categoryId);
    
    org.springframework.data.domain.Page<MasterItem> findByCategoryId(UUID categoryId, org.springframework.data.domain.Pageable pageable);
}

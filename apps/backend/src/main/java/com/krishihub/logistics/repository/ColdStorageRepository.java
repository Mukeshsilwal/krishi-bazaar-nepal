package com.krishihub.logistics.repository;

import com.krishihub.logistics.entity.ColdStorage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ColdStorageRepository extends JpaRepository<ColdStorage, UUID> {
    List<ColdStorage> findByDistrict(String district);
    org.springframework.data.domain.Page<ColdStorage> findByDistrict(String district, org.springframework.data.domain.Pageable pageable);
}

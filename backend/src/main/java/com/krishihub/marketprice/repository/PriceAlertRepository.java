package com.krishihub.marketprice.repository;

import com.krishihub.marketprice.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, UUID> {
    List<PriceAlert> findByUserId(UUID userId);
    List<PriceAlert> findByCropNameAndActiveTrue(String cropName);
}

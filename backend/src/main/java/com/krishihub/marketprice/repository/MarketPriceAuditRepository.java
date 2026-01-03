package com.krishihub.marketprice.repository;

import com.krishihub.marketprice.entity.MarketPriceAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MarketPriceAuditRepository extends JpaRepository<MarketPriceAudit, UUID> {
}

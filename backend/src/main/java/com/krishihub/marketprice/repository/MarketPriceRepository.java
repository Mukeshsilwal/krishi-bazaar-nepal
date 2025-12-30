package com.krishihub.marketprice.repository;

import com.krishihub.marketprice.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, UUID> {

    @Query("SELECT mp FROM MarketPrice mp WHERE " +
            "mp.cropName = :cropName AND mp.district = :district " +
            "ORDER BY mp.priceDate DESC")
    List<MarketPrice> findByCropAndDistrict(
            @Param("cropName") String cropName,
            @Param("district") String district);

    @Query("SELECT mp FROM MarketPrice mp WHERE " +
            "mp.cropName = :cropName AND mp.district = :district AND mp.priceDate = :date")
    Optional<MarketPrice> findByCropDistrictAndDate(
            @Param("cropName") String cropName,
            @Param("district") String district,
            @Param("date") LocalDate date);

    @Query("SELECT mp FROM MarketPrice mp WHERE mp.priceDate = :date ORDER BY mp.cropName")
    List<MarketPrice> findByDate(@Param("date") LocalDate date);

    @Query("SELECT DISTINCT mp.cropName FROM MarketPrice mp ORDER BY mp.cropName")
    List<String> findDistinctCropNames();

    @Query("SELECT DISTINCT mp.district FROM MarketPrice mp ORDER BY mp.district")
    List<String> findDistinctDistricts();
}

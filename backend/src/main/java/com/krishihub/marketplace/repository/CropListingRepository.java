package com.krishihub.marketplace.repository;

import com.krishihub.marketplace.entity.CropListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CropListingRepository extends JpaRepository<CropListing, UUID>, JpaSpecificationExecutor<CropListing> {
    List<CropListing> findByFarmerId(UUID farmerId);

    List<CropListing> findTop5ByFarmerIdOrderByCreatedAtDesc(UUID farmerId);

    long countByFarmerId(UUID farmerId);

    Page<CropListing> findByStatus(CropListing.ListingStatus status, Pageable pageable);

    Page<CropListing> findByFarmerIdAndStatus(UUID farmerId, CropListing.ListingStatus status, Pageable pageable);

    @Query("SELECT cl FROM CropListing cl WHERE cl.farmer.id = :farmerId ORDER BY cl.createdAt DESC")
    Page<CropListing> findByFarmerId(@Param("farmerId") UUID farmerId, Pageable pageable);

    @Query("SELECT cl FROM CropListing cl WHERE " +
            "cl.status = 'ACTIVE' AND " +
            "LOWER(cl.cropName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<CropListing> searchByName(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT DISTINCT cl.cropName FROM CropListing cl WHERE cl.status = 'ACTIVE' ORDER BY cl.cropName")
    List<String> findDistinctCropNames();
}

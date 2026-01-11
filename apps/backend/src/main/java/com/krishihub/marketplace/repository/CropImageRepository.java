package com.krishihub.marketplace.repository;

import com.krishihub.marketplace.entity.CropImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CropImageRepository extends JpaRepository<CropImage, UUID> {

    List<CropImage> findByListingId(UUID listingId);

    Optional<CropImage> findByListingIdAndIsPrimaryTrue(UUID listingId);

    void deleteByListingId(UUID listingId);
}

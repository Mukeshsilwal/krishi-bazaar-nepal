package com.krishihub.marketplace.config;

import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketplaceDataMigration {

    private final CropListingRepository cropListingRepository;

    @PostConstruct
    public void migrateCategories() {
        log.info("Starting Marketplace Data Migration...");
        List<CropListing> listings = cropListingRepository.findByCategoryIsNull();
        if (listings.isEmpty()) {
            log.info("No listings found with null category. Migration skipped.");
            return;
        }

        log.info("Found {} listings with null category. Updating to OTHERS...", listings.size());
        for (CropListing listing : listings) {
            listing.setCategory(CropListing.CropCategory.OTHERS);
        }
        cropListingRepository.saveAll(listings);
        log.info("Successfully migrated {} listings to OTHERS category.", listings.size());
    }
}

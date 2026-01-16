package com.krishihub.marketplace.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.marketplace.dto.CreateListingRequest;
import com.krishihub.marketplace.dto.ListingDto;
import com.krishihub.marketplace.dto.UpdateListingRequest;
import com.krishihub.marketplace.entity.CropImage;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropImageRepository;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
import com.krishihub.shared.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final CropListingRepository listingRepository;
    private final CropImageRepository imageRepository;
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;

    @Transactional
    public ListingDto createListing(UUID userId, CreateListingRequest request) {
        User farmer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Authorization Note: Role check removed - now handled at controller level via @PreAuthorize
        // Controller requires MARKETPLACE:CREATE permission which is granted to FARMER role
        // if (farmer.getRole() != User.UserRole.FARMER) {
        //     throw new BadRequestException("Only farmers can create crop listings");
        // }

        CropListing listing = CropListing.builder()
                .farmer(farmer)
                .cropName(request.getCropName())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .pricePerUnit(request.getPricePerUnit())
                .description(request.getDescription())
                .location(request.getLocation() != null ? request.getLocation() : farmer.getDistrict())
                .status(CropListing.ListingStatus.ACTIVE)
                .build();

        if (request.getCategory() != null) {
            try {
                listing.setCategory(CropListing.CropCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // log error or set default
                 listing.setCategory(CropListing.CropCategory.OTHERS);
            }
        }

        CropListing savedListing = listingRepository.save(listing);
        log.info("Listing created: {} by farmer: {}", savedListing.getId(), userId);

        return ListingDto.fromEntity(savedListing);
    }

    @Transactional
    public String uploadListingImage(UUID listingId, UUID userId, MultipartFile file, boolean isPrimary) {
        CropListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Verify ownership
        if (!listing.getFarmer().getId().equals(userId)) {
            throw new UnauthorizedException("You can only upload images to your own listings");
        }

        // Upload to Cloudinary
        String imageUrl = imageUploadService.uploadImage(file, "crops");

        // If this is primary, unset other primary images
        if (isPrimary) {
            listing.getImages().forEach(img -> img.setIsPrimary(false));
        }

        // Create image record
        CropImage image = CropImage.builder()
                .listing(listing)
                .imageUrl(imageUrl)
                .isPrimary(isPrimary || listing.getImages().isEmpty())
                .build();

        listing.addImage(image);
        listingRepository.save(listing);

        log.info("Image uploaded for listing: {}", listingId);
        return imageUrl;
    }

    public Page<ListingDto> getAllListings(int page, int size, String cropName, String category, String district,
            BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        Pageable pageable = createPageable(page, size, sortBy);

        Specification<CropListing> spec = Specification.where(null);

        // Filter by status (only active)
        spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), CropListing.ListingStatus.ACTIVE));

        // Filter by crop name
        if (cropName != null && !cropName.isEmpty()) {
            spec = spec.and(
                    (root, query, cb) -> cb.like(cb.lower(root.get("cropName")), "%" + cropName.toLowerCase() + "%"));
        }

        // Filter by category
        if (category != null && !category.isEmpty()) {
             try {
                CropListing.CropCategory catEnum = CropListing.CropCategory.valueOf(category.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), catEnum));
             } catch (IllegalArgumentException e) {
                 // ignore invalid category filter
             }
        }

        // Filter by district
        if (district != null && !district.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("location")), district.toLowerCase()));
        }

        // Filter by price range
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("pricePerUnit"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("pricePerUnit"), maxPrice));
        }

        Page<CropListing> listings = listingRepository.findAll(spec, pageable);
        return listings.map(ListingDto::fromEntity);
    }

    public ListingDto getListingById(UUID id) {
        CropListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
        return ListingDto.fromEntity(listing);
    }

    public Page<ListingDto> getMyListings(UUID userId, int page, int size) {
        User farmer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CropListing> listings = listingRepository.findByFarmerId(farmer.getId(), pageable);

        return listings.map(ListingDto::fromEntity);
    }

    @Transactional
    public ListingDto updateListing(UUID id, UUID userId, UpdateListingRequest request) {
        CropListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Verify ownership
        if (!listing.getFarmer().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own listings");
        }

        // Update fields if provided
        if (request.getCropName() != null) {
            listing.setCropName(request.getCropName());
        }
        if (request.getCategory() != null) {
            try {
                listing.setCategory(CropListing.CropCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                 // ignore or error
            }
        }
        if (request.getQuantity() != null) {
            listing.setQuantity(request.getQuantity());
        }
        if (request.getUnit() != null) {
            listing.setUnit(request.getUnit());
        }
        if (request.getPricePerUnit() != null) {
            listing.setPricePerUnit(request.getPricePerUnit());
        }
        if (request.getHarvestDate() != null) {
            listing.setHarvestDate(java.sql.Date.valueOf(request.getHarvestDate()));
        }
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            listing.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            try {
                listing.setStatus(CropListing.ListingStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }
        }

        CropListing updated = listingRepository.save(listing);
        log.info("Listing updated: {}", id);

        return ListingDto.fromEntity(updated);
    }

    @Transactional
    public void deleteListing(UUID id, UUID userId) {
        CropListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Verify ownership
        if (!listing.getFarmer().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own listings");
        }

        // Delete images from Cloudinary
        listing.getImages().forEach(image -> imageUploadService.deleteImage(image.getImageUrl()));

        // Soft delete - mark as deleted
        listing.setStatus(CropListing.ListingStatus.DELETED);
        listingRepository.save(listing);

        log.info("Listing deleted: {}", id);
    }

    public List<String> getAvailableCrops() {
        return listingRepository.findDistinctCropNames();
    }

    private Pageable createPageable(int page, int size, String sortBy) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                    sort = Sort.by(Sort.Direction.ASC, "pricePerUnit");
                    break;
                case "price_desc":
                    sort = Sort.by(Sort.Direction.DESC, "pricePerUnit");
                    break;
                case "quantity_asc":
                    sort = Sort.by(Sort.Direction.ASC, "quantity");
                    break;
                case "quantity_desc":
                    sort = Sort.by(Sort.Direction.DESC, "quantity");
                    break;
                case "name":
                    sort = Sort.by(Sort.Direction.ASC, "cropName");
                    break;
            }
        }

        return PageRequest.of(page, size, sort);
    }
}

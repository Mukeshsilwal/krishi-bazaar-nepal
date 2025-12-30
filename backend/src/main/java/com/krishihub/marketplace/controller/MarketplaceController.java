package com.krishihub.marketplace.controller;

import com.krishihub.marketplace.dto.CreateListingRequest;
import com.krishihub.marketplace.dto.ListingDto;
import com.krishihub.marketplace.dto.UpdateListingRequest;
import com.krishihub.marketplace.service.MarketplaceService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<ListingDto>> createListing(
            Authentication authentication,
            @Valid @RequestBody CreateListingRequest request) {
        String mobileNumber = authentication.getName();
        ListingDto listing = marketplaceService.createListing(mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Listing created successfully", listing));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary) {
        String mobileNumber = authentication.getName();
        String imageUrl = marketplaceService.uploadListingImage(id, mobileNumber, file, isPrimary);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", imageUrl));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ListingDto>>> getAllListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String cropName,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sortBy) {
        Page<ListingDto> listings = marketplaceService.getAllListings(
                page, size, cropName, district, minPrice, maxPrice, sortBy);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingDto>> getListingById(@PathVariable UUID id) {
        ListingDto listing = marketplaceService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success(listing));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ListingDto>>> getMyListings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String mobileNumber = authentication.getName();
        Page<ListingDto> listings = marketplaceService.getMyListings(mobileNumber, page, size);
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingDto>> updateListing(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody UpdateListingRequest request) {
        String mobileNumber = authentication.getName();
        ListingDto listing = marketplaceService.updateListing(id, mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Listing updated successfully", listing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable UUID id,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        marketplaceService.deleteListing(id, mobileNumber);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully", null));
    }

    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableCrops() {
        List<String> crops = marketplaceService.getAvailableCrops();
        return ResponseEntity.ok(ApiResponse.success(crops));
    }
}

package com.krishihub.marketplace.dto;

import com.krishihub.marketplace.entity.CropListing;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingDto {
    private UUID id;
    private FarmerInfo farmer;
    private String cropName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal pricePerUnit;
    private LocalDate harvestDate;
    private String description;
    private String location;
    private String status;
    private List<ImageDto> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FarmerInfo {
        private UUID id;
        private String name;
        private String mobileNumber;
        private String district;
        private String ward;
        private Boolean verified;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageDto {
        private UUID id;
        private String imageUrl;
        private Boolean isPrimary;
    }

    public static ListingDto fromEntity(CropListing listing) {
        return ListingDto.builder()
                .id(listing.getId())
                .farmer(FarmerInfo.builder()
                        .id(listing.getFarmer().getId())
                        .name(listing.getFarmer().getName())
                        .mobileNumber(listing.getFarmer().getMobileNumber())
                        .district(listing.getFarmer().getDistrict())
                        .ward(listing.getFarmer().getWard())
                        .verified(listing.getFarmer().getVerified())
                        .build())
                .cropName(listing.getCropName())
                .quantity(listing.getQuantity())
                .unit(listing.getUnit())
                .pricePerUnit(listing.getPricePerUnit())
                .harvestDate(listing.getHarvestDate())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .status(listing.getStatus().name())
                .images(listing.getImages().stream()
                        .map(img -> ImageDto.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .isPrimary(img.getIsPrimary())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}

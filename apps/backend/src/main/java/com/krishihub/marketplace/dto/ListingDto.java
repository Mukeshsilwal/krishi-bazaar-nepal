package com.krishihub.marketplace.dto;

import com.krishihub.marketplace.entity.CropListing;
import lombok.AllArgsConstructor;
import lombok.Builder;
// I will delay this tool call until I read the file.
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
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
    private String category;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal pricePerUnit;
    private Date harvestDate;
    private Integer harvestWindow;
    private BigDecimal dailyQuantityLimit;
    private Date orderCutoffTime;
    private String description;
    private String location;
    private String status;
    private List<ImageDto> images;
    private Date createdAt;
    private Date updatedAt;

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
                .harvestWindow(listing.getHarvestWindow())
                .dailyQuantityLimit(listing.getDailyQuantityLimit())
                .orderCutoffTime(listing.getOrderCutoffTime())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .category(listing.getCategory() != null ? listing.getCategory().name() : null)
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

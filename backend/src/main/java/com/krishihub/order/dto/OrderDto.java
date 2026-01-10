package com.krishihub.order.dto;

import com.krishihub.order.dto.OrderSource;
import com.krishihub.order.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private UUID id;
    private ListingInfo listing;
    private UserInfo buyer;
    private UserInfo farmer;
    private BigDecimal quantity;
    private BigDecimal totalAmount;
    private String status;
    private LocalDate pickupDate;
    private String pickupLocation;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingInfo {
        private UUID id;
        private String cropName;
        private String unit;
        private BigDecimal pricePerUnit;
        private String location;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String name;
        private String mobileNumber;
        private String district;
    }

    private OrderSource orderSource;
    private java.util.List<OrderItemDto> items;

    public static OrderDto fromEntity(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .listing(order.getListing() != null ? ListingInfo.builder()
                        .id(order.getListing().getId())
                        .cropName(order.getListing().getCropName())
                        .unit(order.getListing().getUnit())
                        .pricePerUnit(order.getListing().getPricePerUnit())
                        .location(order.getListing().getLocation())
                        .build() : null)
                .buyer(UserInfo.builder()
                        .id(order.getBuyer().getId())
                        .name(order.getBuyer().getName())
                        .mobileNumber(order.getBuyer().getMobileNumber())
                        .district(order.getBuyer().getDistrict())
                        .build())
                .farmer(order.getFarmer() != null ? UserInfo.builder()
                        .id(order.getFarmer().getId())
                        .name(order.getFarmer().getName())
                        .mobileNumber(order.getFarmer().getMobileNumber())
                        .district(order.getFarmer().getDistrict())
                        .build() : null)
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .pickupDate(order.getPickupDate())
                .pickupLocation(order.getPickupLocation())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderSource(order.getOrderSource())
                .items(order.getItems().stream().map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .agriProductId(item.getAgriProduct() != null ? item.getAgriProduct().getId() : null)
                        .quantity(item.getQuantity())
                        .pricePerUnit(item.getPricePerUnit())
                        .totalPrice(item.getTotalPrice())
                        .build()).collect(java.util.stream.Collectors.toList()))
                .build();
    }
}

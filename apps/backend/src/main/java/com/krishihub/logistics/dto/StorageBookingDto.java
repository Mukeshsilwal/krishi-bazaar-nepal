package com.krishihub.logistics.dto;

import com.krishihub.logistics.entity.StorageBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageBookingDto {
    private UUID id;
    private UUID farmerId;
    private UUID coldStorageId;
    private String commodity;
    private Double quantity;
    private Date startDate;
    private Date endDate;
    private Double totalPrice;
    private String status;
    private Date createdAt;

    public static StorageBookingDto fromEntity(StorageBooking entity) {
        return StorageBookingDto.builder()
                .id(entity.getId())
                .farmerId(entity.getFarmerId())
                .coldStorageId(entity.getColdStorageId())
                .commodity(entity.getCommodity())
                .quantity(entity.getQuantity())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .totalPrice(entity.getTotalPrice())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

package com.krishihub.logistics.dto;

import com.krishihub.logistics.entity.ColdStorage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColdStorageDto {
    private UUID id;
    private String name;
    private String district;
    private String address;
    private String contactNumber;
    private Double totalCapacity;
    private Double availableCapacity;
    private Double pricePerKgPerDay;

    public static ColdStorageDto fromEntity(ColdStorage entity) {
        return ColdStorageDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .district(entity.getDistrict())
                .address(entity.getLocation())
                .contactNumber(entity.getContactNumber())
                .totalCapacity(entity.getCapacity())
                .availableCapacity(entity.getAvailableCapacity())
                .pricePerKgPerDay(entity.getPricePerKgPerDay() != null ? entity.getPricePerKgPerDay().doubleValue() : null)
                .build();
    }
}

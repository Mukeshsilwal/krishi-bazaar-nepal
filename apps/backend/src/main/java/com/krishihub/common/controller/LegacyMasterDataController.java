package com.krishihub.common.controller;

import com.krishihub.common.entity.AdministrativeUnit;
import com.krishihub.common.entity.CropType;
import com.krishihub.common.service.LegacyMasterDataService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/master-data")
@RequiredArgsConstructor
public class LegacyMasterDataController {

    private final LegacyMasterDataService masterDataService;

    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<CropType>>> getCropTypes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nameEn,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(ApiResponse.success("Crop types fetched", 
            com.krishihub.shared.dto.PaginatedResponse.from(masterDataService.getAllCropTypes(pageable))));
    }

    @PostMapping("/crops")
    public ResponseEntity<ApiResponse<CropType>> createCropType(@RequestBody CropType cropType) {
        return ResponseEntity.ok(ApiResponse.success("Crop type created", masterDataService.createCropType(cropType)));
    }

    @GetMapping("/units")
    public ResponseEntity<ApiResponse<List<AdministrativeUnit>>> getUnits(
            @RequestParam(required = false) AdministrativeUnit.UnitType type,
            @RequestParam(required = false) UUID parentId) {
        if (parentId != null) {
            return ResponseEntity.ok(ApiResponse.success("Sub-units fetched", masterDataService.getSubUnits(parentId)));
        }
        if (type != null) {
            return ResponseEntity.ok(ApiResponse.success("Units fetched", masterDataService.getUnitsByType(type)));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Must provide type or parentId", null));
    }

    @PostMapping("/units")
    public ResponseEntity<ApiResponse<AdministrativeUnit>> createUnit(@RequestBody AdministrativeUnit unit) {
        return ResponseEntity.ok(ApiResponse.success("Unit created", masterDataService.createAdministrativeUnit(unit)));
    }
}

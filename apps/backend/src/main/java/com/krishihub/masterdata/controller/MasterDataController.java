package com.krishihub.masterdata.controller;

import com.krishihub.masterdata.dto.MasterCategoryDto;
import com.krishihub.masterdata.dto.MasterDataResponse;
import com.krishihub.masterdata.dto.MasterItemDto;
import com.krishihub.masterdata.service.MasterDataService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    // --- Public Endpoints ---

    @GetMapping("/v1/master-data/{categoryCode}")
    public ResponseEntity<ApiResponse<MasterDataResponse>> getMasterData(@PathVariable String categoryCode) {
        return ResponseEntity
                .ok(ApiResponse.success("Master data fetched", masterDataService.getPublicMasterData(categoryCode)));
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/master-data/categories")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<MasterCategoryDto>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
            
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
            
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", 
                masterDataService.getAllCategories(pageable)));
    }

    @PostMapping("/admin/master-data/categories")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<MasterCategoryDto>> createCategory(@RequestBody MasterCategoryDto request) {
        return ResponseEntity.ok(ApiResponse.success("Category created", masterDataService.createCategory(request)));
    }

    @GetMapping("/admin/master-data/categories/{categoryId}/items")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<MasterItemDto>>> getItemsByCategory(
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "sortOrder,asc") String sort) {
            
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
            
        return ResponseEntity
                .ok(ApiResponse.success("Items fetched", masterDataService.getItemsByCategory(categoryId, pageable)));
    }

    @PostMapping("/admin/master-data/categories/{categoryId}/items")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<MasterItemDto>> createItem(@PathVariable UUID categoryId,
            @RequestBody MasterItemDto request) {
        return ResponseEntity
                .ok(ApiResponse.success("Item created", masterDataService.createItem(categoryId, request)));
    }

    @PutMapping("/admin/master-data/items/{itemId}")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<MasterItemDto>> updateItem(@PathVariable UUID itemId,
            @RequestBody MasterItemDto request) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", masterDataService.updateItem(itemId, request)));
    }
}

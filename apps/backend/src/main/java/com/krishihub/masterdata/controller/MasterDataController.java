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
    public ResponseEntity<ApiResponse<List<MasterCategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", masterDataService.getAllCategories()));
    }

    @PostMapping("/admin/master-data/categories")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<MasterCategoryDto>> createCategory(@RequestBody MasterCategoryDto request) {
        return ResponseEntity.ok(ApiResponse.success("Category created", masterDataService.createCategory(request)));
    }

    @GetMapping("/admin/master-data/categories/{categoryId}/items")
    @PreAuthorize("hasAuthority('MASTERDATA:MANAGE')")
    public ResponseEntity<ApiResponse<List<MasterItemDto>>> getItemsByCategory(@PathVariable UUID categoryId) {
        return ResponseEntity
                .ok(ApiResponse.success("Items fetched", masterDataService.getItemsByCategory(categoryId)));
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

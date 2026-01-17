package com.krishihub.logistics.controller;

import com.krishihub.logistics.entity.ColdStorage;
import com.krishihub.logistics.entity.StorageBooking;
import com.krishihub.logistics.service.ColdStorageService;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.dto.PaginatedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics/cold-storages")
@RequiredArgsConstructor
public class ColdStorageController {

    private final ColdStorageService coldStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<com.krishihub.logistics.dto.ColdStorageDto>>> getColdStorages(
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
            
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        if (district != null) {
            return ResponseEntity.ok(ApiResponse.success(
                coldStorageService.getColdStorageByDistrict(district, pageable)));
        }
        return ResponseEntity.ok(ApiResponse.success(
            coldStorageService.getAllColdStorages(pageable)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('LOGISTICS:MANAGE')")
    public ResponseEntity<ApiResponse<ColdStorage>> createColdStorage(@RequestBody ColdStorage coldStorage) {
        return ResponseEntity.ok(ApiResponse.success("Cold storage created successfully", coldStorageService.createColdStorage(coldStorage)));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<ApiResponse<com.krishihub.logistics.entity.StorageBooking>> bookStorage(
            @PathVariable java.util.UUID id, 
            @RequestBody com.krishihub.logistics.entity.StorageBooking booking) {
        booking.setColdStorageId(id);
        return ResponseEntity.ok(ApiResponse.success(coldStorageService.bookStorage(booking)));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAuthority('LOGISTICS:MANAGE')")
    public ResponseEntity<ApiResponse<PaginatedResponse<com.krishihub.logistics.dto.StorageBookingDto>>> getAllBookings(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                coldStorageService.getAllBookings(pageable)));
    }
}

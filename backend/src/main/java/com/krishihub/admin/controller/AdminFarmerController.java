package com.krishihub.admin.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.krishihub.admin.dto.FarmerProfileDto;
import com.krishihub.admin.service.AdminFarmerService;
import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/farmers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFarmerController {

    private final AdminFarmerService farmerService;

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<User>>> getAllFarmers(
            @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Farmers fetched", farmerService.getAllFarmers(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmerProfileDto>> getFarmerProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Farmer profile fetched", farmerService.getFarmerProfile(id)));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<Object>> verifyFarmer(@PathVariable UUID id,
            @RequestBody com.krishihub.admin.dto.FarmerVerificationRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Farmer verification updated", farmerService.verifyFarmer(id, request)));
    }

    @GetMapping("/export")
    public void exportFarmers(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"farmers.csv\"");
        farmerService.exportFarmers(response.getWriter());
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<Object>> importFarmers(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        farmerService.importFarmers(file);
        return ResponseEntity.ok(ApiResponse.success("Farmers imported successfully", null));
    }
}

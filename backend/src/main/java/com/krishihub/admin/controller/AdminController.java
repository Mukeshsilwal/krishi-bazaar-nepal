package com.krishihub.admin.controller;

import org.springframework.security.access.prepost.PreAuthorize;

import com.krishihub.admin.dto.AdminDashboardStats;
import com.krishihub.admin.service.AdminService;
import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", adminService.getDashboardStats()));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<com.krishihub.analytics.entity.UserActivity>>> getActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Activities fetched",
                adminService.getAllActivities(org.springframework.data.domain.PageRequest.of(page, size))));
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingVendors() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingVendors()));
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveUser(@PathVariable UUID userId) {
        adminService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User approved successfully", null));
    }
}

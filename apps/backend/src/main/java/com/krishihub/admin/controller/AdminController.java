package com.krishihub.admin.controller;

import com.krishihub.admin.dto.AdminDashboardStats;
import com.krishihub.admin.service.AdminService;
import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.dto.PaginatedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<PaginatedResponse<com.krishihub.analytics.entity.UserActivity>>> getActivities(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Activities fetched",
                PaginatedResponse.from(adminService.getAllActivities(pageable))));
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<ApiResponse<PaginatedResponse<User>>> getPendingVendors(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PaginatedResponse.from(adminService.getPendingVendors(pageable))));
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<ApiResponse<Void>> approveUser(@PathVariable UUID userId) {
        adminService.approveUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User approved successfully", null));
    }
}

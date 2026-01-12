package com.krishihub.admin.controller;

import com.krishihub.admin.service.AdminUserService;
import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean status) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                adminUserService.getAllUsers(search, role, status,
                        PageRequest.of(page, size))));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> status) {
        return ResponseEntity.ok(ApiResponse.success("User status updated",
                adminUserService.updateUserStatus(id, status.get("enabled"))));
    }
}

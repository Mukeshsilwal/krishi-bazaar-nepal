package com.krishihub.admin.controller;

import com.krishihub.admin.dto.CreateRoleRequest;
import com.krishihub.admin.dto.RoleDto;
import com.krishihub.admin.service.AdminRoleService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rbac")
@RequiredArgsConstructor
public class AdminRbacController {

    private final AdminRoleService adminRoleService;

    @PostMapping("/roles")
    // @PreAuthorize("hasAuthority('ROLE_CREATE')") // Uncomment when permissions
    // are seeded
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        // TODO: Get authenticated user ID
        UUID actorId = UUID.randomUUID();
        RoleDto role = adminRoleService.createRole(request, actorId);
        return ResponseEntity.ok(ApiResponse.success("Role created successfully", role));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        List<RoleDto> roles = adminRoleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success("Roles fetched successfully", roles));
    }

    @PostMapping("/users/{userId}/roles/{roleId}")
    public ResponseEntity<ApiResponse<Void>> assignRole(@PathVariable UUID userId, @PathVariable UUID roleId) {
        // TODO: Get authenticated user ID
        UUID actorId = UUID.randomUUID();
        adminRoleService.assignRoleToUser(userId, roleId, actorId);
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", null));
    }
}

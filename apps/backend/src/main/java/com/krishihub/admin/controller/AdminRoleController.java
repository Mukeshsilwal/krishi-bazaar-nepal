package com.krishihub.admin.controller;

import com.krishihub.admin.dto.CreateRoleRequest;
import com.krishihub.admin.dto.PermissionDto;
import com.krishihub.admin.dto.RoleDto;
import com.krishihub.admin.service.PermissionService;
import com.krishihub.admin.service.RoleService;
import com.krishihub.auth.entity.Permission;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin controller for managing roles and permissions in the RBAC system.
 * All endpoints require ADMIN:ROLES permission.
 */
@RestController
@RequestMapping("/api/admin/rbac")
@RequiredArgsConstructor
public class AdminRoleController {

    private final RoleService roleService;
    private final PermissionService permissionService;

    /**
     * Get all roles with their permissions.
     */
    @GetMapping("/roles")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_READ)")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<RoleDto>>> getAllRoles(
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

        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(roleService.getAllRoles(pageable))));
    }

    /**
     * Create a new custom role.
     */
    @PostMapping("/roles")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_WRITE)")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody CreateRoleRequest request) {
        RoleDto role = roleService.createRole(request);
        return ResponseEntity.ok(ApiResponse.success("Role created successfully", role));
    }

    /**
     * Update role permissions.
     */
    @PutMapping("/roles/{roleId}/permissions")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_WRITE)")
    public ResponseEntity<ApiResponse<RoleDto>> updateRolePermissions(
            @PathVariable UUID roleId,
            @RequestBody Set<String> permissionNames) {
        RoleDto role = roleService.updateRolePermissions(roleId, permissionNames);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", role));
    }

    /**
     * Delete a custom role.
     */
    @DeleteMapping("/roles/{roleId}")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_DELETE)")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully", null));
    }

    /**
     * Get all permissions, optionally grouped by module.
     */
    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_PERMISSION_READ)")
    public ResponseEntity<ApiResponse<?>> getAllPermissions(
            @RequestParam(required = false, defaultValue = "false") boolean grouped,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        
        if (grouped) {
            Map<String, List<Permission>> groupedPermissions = permissionService.getPermissionsGroupedByModule();
            // Flatten for response (frontend can re-group if needed)
            List<PermissionDto> permissions = groupedPermissions.values().stream()
                    .flatMap(List::stream)
                    .map(this::toPermissionDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(permissions));
        } else {
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
            
            return ResponseEntity.ok(ApiResponse.success(
                com.krishihub.shared.dto.PaginatedResponse.from(permissionService.getAllPermissions(pageable)
                    .map(this::toPermissionDto))));
        }
    }

    /**
     * Assign a role to a user.
     */
    @PostMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_WRITE)")
    public ResponseEntity<ApiResponse<Void>> assignRoleToUser(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {
        roleService.assignRoleToUser(userId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Role assigned to user successfully", null));
    }

    /**
     * Remove a role from a user.
     */
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).RBAC_ROLE_WRITE)")
    public ResponseEntity<ApiResponse<Void>> removeRoleFromUser(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {
        roleService.removeRoleFromUser(userId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Role removed from user successfully", null));
    }

    /**
     * Convert Permission entity to DTO.
     */
    private PermissionDto toPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .name(permission.getName())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}

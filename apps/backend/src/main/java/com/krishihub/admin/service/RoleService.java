package com.krishihub.admin.service;

import com.krishihub.admin.dto.CreateRoleRequest;
import com.krishihub.admin.dto.RoleDto;
import com.krishihub.auth.entity.Permission;
import com.krishihub.auth.entity.Role;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.RoleRepository;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing roles in the RBAC system.
 * Handles role CRUD operations and user-role assignments.
 */
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    /**
     * Get all roles with their permissions.
     *
     * @return List of role DTOs
     */
    @Transactional(readOnly = true)
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new custom role with specified permissions.
     *
     * @param request Role creation request
     * @return Created role DTO
     */
    @Transactional
    public RoleDto createRole(CreateRoleRequest request) {
        // Validate permissions exist
        permissionService.validatePermissionsExist(request.getPermissionNames());

        // Get permission entities
        Set<Permission> permissions = permissionService.getPermissionsByNames(request.getPermissionNames());

        // Create role
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .isSystemDefined(false) // Custom roles are not system-defined
                .permissions(new HashSet<>(permissions))
                .build();

        Role savedRole = roleRepository.save(role);
        return toDto(savedRole);
    }

    /**
     * Update role permissions.
     * System-defined roles cannot be modified.
     *
     * @param roleId          Role ID
     * @param permissionNames New list of permission names
     * @return Updated role DTO
     */
    @Transactional
    public RoleDto updateRolePermissions(UUID roleId, Set<String> permissionNames) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.getIsSystemDefined()) {
            throw new IllegalStateException("Cannot modify system-defined roles");
        }

        // Validate and get permissions
        permissionService.validatePermissionsExist(permissionNames);
        Set<Permission> permissions = permissionService.getPermissionsByNames(permissionNames);

        role.setPermissions(new HashSet<>(permissions));
        Role updatedRole = roleRepository.save(role);
        return toDto(updatedRole);
    }

    /**
     * Delete a custom role.
     * System-defined roles cannot be deleted.
     *
     * @param roleId Role ID
     */
    @Transactional
    public void deleteRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.getIsSystemDefined()) {
            throw new IllegalStateException("Cannot delete system-defined roles");
        }

        roleRepository.delete(role);
    }

    /**
     * Assign a role to a user.
     *
     * @param userId User ID
     * @param roleId Role ID
     */
    @Transactional
    public void assignRoleToUser(UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        boolean roleExists = user.getRoles().stream()
                .anyMatch(r -> r.getId().equals(role.getId()));

        if (!roleExists) {
            user.getRoles().add(role);
            userRepository.save(user);
        }
    }

    /**
     * Remove a role from a user.
     *
     * @param userId User ID
     * @param roleId Role ID
     */
    @Transactional
    public void removeRoleFromUser(UUID userId, UUID roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Role not found");
        }

        user.getRoles().removeIf(r -> r.getId().equals(roleId));
        userRepository.save(user);
    }

    /**
     * Convert Role entity to DTO.
     */
    private RoleDto toDto(Role role) {
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystemDefined(role.getIsSystemDefined())
                .permissions(role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}

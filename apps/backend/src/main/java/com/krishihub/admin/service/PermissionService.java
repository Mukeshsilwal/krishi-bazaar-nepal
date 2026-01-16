package com.krishihub.admin.service;

import com.krishihub.auth.entity.Permission;
import com.krishihub.auth.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing permissions in the RBAC system.
 * Provides methods to retrieve and validate permissions.
 */
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    /**
     * Get all permissions in the system.
     * @return List of all permissions
     */
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    /**
     * Get permissions grouped by module for easier UI display.
     * @return Map of module name to list of permissions
     */
    @Transactional(readOnly = true)
    public Map<String, List<Permission>> getPermissionsGroupedByModule() {
        return permissionRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        permission -> permission.getModule() != null ? permission.getModule() : "OTHER"
                ));
    }

    /**
     * Validate that all permission names exist in the database.
     * Used during role creation/update to ensure valid permissions.
     * @param permissionNames Set of permission names to validate
     * @throws IllegalArgumentException if any permission name is invalid
     */
    public void validatePermissionsExist(Set<String> permissionNames) {
        Set<String> existingPermissions = permissionRepository.findAll().stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());

        Set<String> invalidPermissions = permissionNames.stream()
                .filter(name -> !existingPermissions.contains(name))
                .collect(Collectors.toSet());

        if (!invalidPermissions.isEmpty()) {
            throw new IllegalArgumentException(
                    "Invalid permissions: " + String.join(", ", invalidPermissions)
            );
        }
    }

    /**
     * Get permissions by their names.
     * @param permissionNames Set of permission names
     * @return Set of Permission entities
     */
    @Transactional(readOnly = true)
    public Set<Permission> getPermissionsByNames(Set<String> permissionNames) {
        return permissionRepository.findByNameIn(permissionNames);
    }
}

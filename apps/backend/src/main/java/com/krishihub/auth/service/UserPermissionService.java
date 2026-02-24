package com.krishihub.auth.service;

import com.krishihub.auth.entity.Permission;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPermissionService {

    private final UserRepository userRepository;

    /**
     * Fetch user permissions with caching.
     * Cache key is userId, value is Set of permission strings.
     * TTL should be configured in CacheConfig (e.g. 60s).
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "userPermissions", key = "#userId")
    public Set<String> getUserPermissions(UUID userId) {
        log.debug("Fetching permissions from DB for user: {}", userId);
        return userRepository.findById(userId)
                .map(user -> {
                    Set<String> permissions = user.getRoles().stream()
                            .flatMap(role -> role.getPermissions().stream())
                            .map(Permission::getName)
                            .collect(Collectors.toSet());

                    // Fallback for users with only enum role (e.g. newly registered or before migration)
                    if (permissions.isEmpty()) {
                        if (user.getRole() == User.UserRole.ADMIN || user.getRole() == User.UserRole.SUPER_ADMIN) {
                            log.info("Applying fallback ADMIN permissions for user: {}", userId);
                            return Set.of(
                                "ADMIN:PANEL", "ADMIN:READ", "ADMIN:WRITE", 
                                "ADMIN:USERS", "ADMIN:ROLES", "ADMIN:SETTINGS",
                                "USER:READ", "USER:VERIFY"
                            );
                        }
                        if (user.getRole() == User.UserRole.FARMER) {
                            return Set.of("MARKETPLACE:READ", "MARKETPLACE:CREATE", "ORDER:READ", "ORDER:CREATE");
                        }
                    }
                    return permissions;
                })
                .orElse(Collections.emptySet());
    }

    /**
     * Check if user has specific permission.
     * Uses the cached permission set.
     */
    public boolean hasPermission(UUID userId, String permission) {
        return getUserPermissions(userId).contains(permission);
    }

    /**
     * Invalidate cache when roles/permissions change.
     */
    @CacheEvict(value = "userPermissions", key = "#userId")
    public void invalidateUserPermissionCache(UUID userId) {
        log.info("Invalidating permission cache for user: {}", userId);
    }
}

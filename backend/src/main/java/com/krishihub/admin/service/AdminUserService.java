package com.krishihub.admin.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public org.springframework.data.domain.Page<User> getAllUsers(String search, String role, Boolean status,
            org.springframework.data.domain.Pageable pageable) {
        User.UserRole userRole = null;
        if (role != null && !role.isEmpty() && !role.equalsIgnoreCase("all")) {
            try {
                userRole = User.UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid role
            }
        }

        String searchQuery = (search != null && !search.isEmpty()) ? search : null;

        return userRepository.searchUsers(userRole, status, searchQuery, pageable);
    }



    @Transactional
    public User updateUserStatus(UUID userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        User savedUser = userRepository.save(user);
        
        // Audit
        try {
            UUID adminId = getCurrentUserId();
            auditService.logAction(adminId, "UPDATE_USER_STATUS", "USER", userId.toString(), 
                java.util.Map.of("status", enabled ? "Active" : "Disabled"), "SYSTEM", "WEB");
        } catch (Exception e) {
            // log error
        }
        
        return savedUser;
    }

    private UUID getCurrentUserId() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.krishihub.auth.model.CustomUserDetails) {
                return ((com.krishihub.auth.model.CustomUserDetails) auth.getPrincipal()).getId();
            }
        } catch (Exception e) {
            // ignore
        }
        return UUID.fromString("00000000-0000-0000-0000-000000000000"); // System/Unknown
    }
}

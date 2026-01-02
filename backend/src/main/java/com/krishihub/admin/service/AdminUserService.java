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
        return userRepository.save(user);
    }
}

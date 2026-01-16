package com.krishihub.admin.controller;

import com.krishihub.admin.dto.UserVerificationRequest;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.shared.dto.PaginatedResponse;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin controller for managing user verification.
 * Allows admins to approve/reject VENDOR and EXPERT registrations.
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserVerificationController {

    private final UserRepository userRepository;

    /**
     * Get all pending (unverified) users.
     * Typically VENDOR and EXPERT users waiting for approval.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN:USERS')")
    public ResponseEntity<ApiResponse<PaginatedResponse<User>>> getPendingUsers(Pageable pageable) {
        Page<User> pendingUsers = userRepository.findByVerifiedFalse(pageable);
        
        PaginatedResponse<User> response = PaginatedResponse.<User>builder()
                .content(pendingUsers.getContent())
                .page(pendingUsers.getNumber())
                .size(pendingUsers.getSize())
                .totalElements(pendingUsers.getTotalElements())
                .totalPages(pendingUsers.getTotalPages())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Verify/approve a user.
     * Sets verified = true for the user.
     */
    @PutMapping("/{userId}/verify")
    @PreAuthorize("hasAuthority('USER:VERIFY')")
    public ResponseEntity<ApiResponse<User>> verifyUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setVerified(true);
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("User verified successfully", user));
    }

    /**
     * Reject/unverify a user.
     * Sets verified = false for the user.
     */
    @PutMapping("/{userId}/unverify")
    @PreAuthorize("hasAuthority('USER:VERIFY')")
    public ResponseEntity<ApiResponse<User>> unverifyUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setVerified(false);
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("User unverified successfully", user));
    }

    /**
     * Delete a pending user (reject registration).
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER:DELETE')")
    public ResponseEntity<ApiResponse<Void>> deletePendingUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        userRepository.delete(user);
        
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    /**
     * Get all verified users.
     */
    @GetMapping("/verified")
    @PreAuthorize("hasAuthority('ADMIN:USERS')")
    public ResponseEntity<ApiResponse<PaginatedResponse<User>>> getVerifiedUsers(Pageable pageable) {
        Page<User> verifiedUsers = userRepository.findByVerifiedTrue(pageable);
        
        PaginatedResponse<User> response = PaginatedResponse.<User>builder()
                .content(verifiedUsers.getContent())
                .page(verifiedUsers.getNumber())
                .size(verifiedUsers.getSize())
                .totalElements(verifiedUsers.getTotalElements())
                .totalPages(verifiedUsers.getTotalPages())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

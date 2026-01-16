package com.krishihub.auth.controller;

import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for public user role information.
 * Provides available roles for user registration.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserRoleController {

    /**
     * Get available user roles for public registration.
     * Excludes ADMIN and SUPER_ADMIN which require secret key.
     * 
     * @return List of available roles: FARMER, BUYER, VENDOR, EXPERT
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableRoles() {
        List<String> availableRoles = Arrays.stream(User.UserRole.values())
                .filter(role -> role != User.UserRole.ADMIN && role != User.UserRole.SUPER_ADMIN)
                .map(Enum::name)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("Available roles retrieved successfully", availableRoles));
    }
}

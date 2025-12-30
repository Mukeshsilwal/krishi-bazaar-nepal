package com.krishihub.admin.controller;

import com.krishihub.admin.service.AdminService;
import com.krishihub.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<List<User>> getPendingVendors() {
        return ResponseEntity.ok(adminService.getPendingVendors());
    }

    @PostMapping("/users/{userId}/approve")
    public ResponseEntity<Void> approveUser(@PathVariable UUID userId) {
        adminService.approveUser(userId);
        return ResponseEntity.ok().build();
    }
}

package com.krishihub.notification.controller;

import com.krishihub.notification.entity.Notification;
import com.krishihub.notification.service.NotificationService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;
import com.krishihub.common.context.UserContextHolder;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications() {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(userId)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(userId)));
    }

    @PostMapping("/tokens")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> registerToken(@RequestBody DeviceTokenRequest request) {
        UUID userId = UserContextHolder.getUserId();
        notificationService.registerDeviceToken(userId, request.getToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success("Device token registered", null));
    }

    @lombok.Data
    public static class DeviceTokenRequest {
        private String token;
        private String deviceType;
    }
}

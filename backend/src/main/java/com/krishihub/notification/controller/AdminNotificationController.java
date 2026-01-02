package com.krishihub.notification.controller;

import com.krishihub.notification.entity.NotificationTemplate;
import com.krishihub.notification.service.AdminNotificationService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminNotificationService notificationService;
    private final com.krishihub.notification.service.NotificationProducerService producerService;

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<NotificationTemplate>>> getTemplates() {
        return ResponseEntity.ok(ApiResponse.success("Templates fetched", notificationService.getAllTemplates()));
    }

    @PostMapping("/templates")
    public ResponseEntity<ApiResponse<NotificationTemplate>> createTemplate(
            @RequestBody NotificationTemplate template) {
        return ResponseEntity.ok(ApiResponse.success("Template created", notificationService.createTemplate(template)));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendNotification(@RequestParam String templateName,
            @RequestParam UUID userId, @RequestBody Map<String, String> params) {
        // Updated to use producer service (this requires refactoring
        // AdminNotificationService to return Notification object or call producer
        // directly)
        // For now, let's keep it simple: AdminNotificationService creates entity,
        // returns it, controller sends to queue.
        // OR AdminNotificationService calls producer. Let's assume
        // AdminNotificationService will be updated to use producer.
        notificationService.sendTemplatedNotification(templateName, userId, params);
        return ResponseEntity.ok(ApiResponse.success("Notification queued", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", notificationService.getDashboardStats()));
    }

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Void>> sendBroadcast(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.get("title");
        String message = (String) payload.get("message");
        String channel = (String) payload.get("channel");
        String role = (String) payload.get("targetRole"); // Expecting targetRole from frontend
        String targetValue = (String) payload.get("targetValue"); // Mobile number for SINGLE
        String priority = (String) payload.getOrDefault("priority", "NORMAL");

        notificationService.sendBroadcast(title, message, channel, role, targetValue, priority);
        return ResponseEntity.ok(ApiResponse.success("Broadcast queued", null));
    }

    @PostMapping("/retry-pending")
    public ResponseEntity<ApiResponse<Void>> retryPending() {
        notificationService.retryPendingNotifications();
        return ResponseEntity.ok(ApiResponse.success("Retried pending notifications", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<com.krishihub.notification.entity.Notification>>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity
                .ok(ApiResponse.success("History fetched", notificationService.getNotificationHistory(page, size)));
    }
}

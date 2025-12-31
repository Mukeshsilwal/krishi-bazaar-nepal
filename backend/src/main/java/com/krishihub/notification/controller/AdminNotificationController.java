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
        notificationService.sendTemplatedNotification(templateName, userId, params);
        return ResponseEntity.ok(ApiResponse.success("Notification sent", null));
    }
}

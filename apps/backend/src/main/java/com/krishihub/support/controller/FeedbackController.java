package com.krishihub.support.controller;

import com.krishihub.auth.entity.User;
import com.krishihub.shared.dto.ApiResponse;
import com.krishihub.support.entity.Feedback;
import com.krishihub.support.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/feedback")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody FeedbackRequest request) {
        // Assuming CustomUserDetails or we cast to User entity if UserDetails is our
        // entity
        // For now, let's look up by username or if we have ID in token principal
        // Simpler: assume we can get ID from userDetails or lookup
        UUID userId = ((com.krishihub.auth.model.CustomUserDetails) userDetails).getId();

        return ResponseEntity.ok(ApiResponse.success("Feedback submitted",
                feedbackService.submitFeedback(userId, request.getType(), request.getMessage())));
    }

    @GetMapping("/admin/feedback")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<com.krishihub.support.dto.FeedbackDto>>> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
            
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "desc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );
        
        return ResponseEntity.ok(ApiResponse.success("Feedback list", 
            feedbackService.getAllFeedback(pageable)));
    }

    @PatchMapping("/admin/feedback/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN:PANEL')")
    public ResponseEntity<ApiResponse<Feedback>> updateStatus(
            @PathVariable UUID id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Feedback status updated",
                feedbackService.updateStatus(id, request.getStatus())));
    }

    @lombok.Data
    public static class FeedbackRequest {
        private String type;
        private String message;
    }

    @lombok.Data
    public static class StatusUpdateRequest {
        private String status;
    }
}

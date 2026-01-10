package com.krishihub.knowledge.moderation;

import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge/moderation")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT_REVIEWER')")
public class ModerationController {

    private final ModerationService moderationService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ModerationQueue>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.success(moderationService.getPendingRequests()));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRequest(@PathVariable UUID id, @RequestParam UUID reviewerId) {
        moderationService.approveRequest(id, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Request approved", null));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(@PathVariable UUID id, @RequestParam UUID reviewerId,
            @RequestBody(required = false) String comments) {
        moderationService.rejectRequest(id, reviewerId, comments);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", null));
    }
}

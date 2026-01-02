package com.krishihub.knowledge.moderation;

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
    public ResponseEntity<List<ModerationQueue>> getPendingRequests() {
        return ResponseEntity.ok(moderationService.getPendingRequests());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveRequest(@PathVariable UUID id, @RequestParam UUID reviewerId) {
        moderationService.approveRequest(id, reviewerId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectRequest(@PathVariable UUID id, @RequestParam UUID reviewerId,
            @RequestBody(required = false) String comments) {
        moderationService.rejectRequest(id, reviewerId, comments);
        return ResponseEntity.ok().build();
    }
}

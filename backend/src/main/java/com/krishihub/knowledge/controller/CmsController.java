package com.krishihub.knowledge.controller;

import com.krishihub.knowledge.dto.WorkflowActionRequest;
import com.krishihub.knowledge.service.CmsService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/cms")
@RequiredArgsConstructor
public class CmsController {

    private final CmsService cmsService;

    @GetMapping("/articles")
    public ResponseEntity<java.util.List<com.krishihub.knowledge.entity.Article>> getArticles() {
        return ResponseEntity.ok(cmsService.getAllArticles());
    }

    @PostMapping("/articles/{articleId}/workflow")
    public ResponseEntity<ApiResponse<Void>> performWorkflowAction(
            @PathVariable UUID articleId,
            @Valid @RequestBody WorkflowActionRequest request) {

        // TODO: Get authenticated user ID
        UUID actorId = UUID.randomUUID();

        cmsService.performWorkflowAction(articleId, request, actorId);

        return ResponseEntity.ok(ApiResponse.success("Workflow action executed successfully", null));
    }
}

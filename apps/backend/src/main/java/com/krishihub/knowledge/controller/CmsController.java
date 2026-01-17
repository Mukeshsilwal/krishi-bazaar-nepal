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
@org.springframework.security.access.prepost.PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).CMS_MANAGE)")
public class CmsController {

    private final CmsService cmsService;

    @GetMapping("/articles")
    public ResponseEntity<com.krishihub.shared.dto.PaginatedResponse<com.krishihub.knowledge.entity.Article>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
            
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );
        
        return ResponseEntity.ok(com.krishihub.shared.dto.PaginatedResponse.from(cmsService.getAllArticles(pageable)));
    }

    @PostMapping("/articles/{articleId}/workflow")
    public ResponseEntity<ApiResponse<Void>> performWorkflowAction(
            @PathVariable UUID articleId,
            @Valid @RequestBody WorkflowActionRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.krishihub.auth.model.CustomUserDetails userDetails) {

        UUID actorId = userDetails.getId();

        cmsService.performWorkflowAction(articleId, request, actorId);

        return ResponseEntity.ok(ApiResponse.success("Workflow action executed successfully", null));
    }
}

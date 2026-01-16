package com.krishihub.content.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.content.dto.ContentDTO;
import com.krishihub.content.dto.ContentFilterDTO;
import com.krishihub.content.service.ContentService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.krishihub.common.context.UserContextHolder;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/content")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority(T(com.krishihub.auth.constant.PermissionConstants).CONTENT_MANAGE)")
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContentDTO>>> getContents(
            ContentFilterDTO filters,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Contents retrieved",
                contentService.getContents(filters, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentDTO>> getContent(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Content retrieved",
                contentService.getContent(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContentDTO>> createContent(@RequestBody ContentDTO dto) {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success("Content created",
                contentService.createContent(dto, userId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentDTO>> updateContent(
            @PathVariable UUID id,
            @RequestBody ContentDTO dto,
            @RequestParam(required = false) String reason) {
        UUID userId = UserContextHolder.getUserId();
        return ResponseEntity.ok(ApiResponse.success("Content updated",
                contentService.updateContent(id, dto, userId, reason)));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Void>> submitForReview(@PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        contentService.submitForReview(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Content submitted for review", null));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Void>> publishContent(@PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        contentService.publishContent(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Content published", null));
    }

    @PostMapping("/{id}/deprecate")
    public ResponseEntity<ApiResponse<Void>> deprecateContent(@PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        contentService.deprecateContent(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Content deprecated", null));
    }
}

package com.krishihub.knowledge.controller;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.KnowledgeCategory;
import com.krishihub.knowledge.service.KnowledgeService;
import com.krishihub.shared.dto.ApiResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    // Public Endpoints
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<KnowledgeCategory>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "nameEn,asc") String sort) {
            
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

        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(knowledgeService.getAllCategories(pageable))));
    }

    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<com.krishihub.shared.dto.PaginatedResponse<Article>>> getArticles(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status,
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

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("undefined")) {
            return ResponseEntity.ok(ApiResponse.success(
                com.krishihub.shared.dto.PaginatedResponse.from(knowledgeService.getAllArticles(status, pageable))));
        }

        UUID catId = null;
        if (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("undefined")) {
             try {
                 catId = UUID.fromString(categoryId);
             } catch (IllegalArgumentException e) {}
        }

        String cleanTag = (tag != null && !tag.trim().isEmpty() && !tag.equalsIgnoreCase("undefined")) ? tag : null;

        if (catId != null) {
            return ResponseEntity.ok(ApiResponse.success(
                com.krishihub.shared.dto.PaginatedResponse.from(knowledgeService.getArticlesByCategory(catId, pageable))));
        }
        if (cleanTag != null) {
            return ResponseEntity.ok(ApiResponse.success(
                com.krishihub.shared.dto.PaginatedResponse.from(knowledgeService.getArticlesByTag(cleanTag, pageable))));
        }
        return ResponseEntity.ok(ApiResponse.success(
            com.krishihub.shared.dto.PaginatedResponse.from(knowledgeService.getPublishedArticles(pageable))));
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<ApiResponse<Article>> getArticle(@PathVariable String id) {
        UUID articleId;
        try {
            articleId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid Article ID: " + id);
        }
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.getArticleById(articleId)));
    }

    // Admin Endpoints
    @PostMapping("/categories")
    @PreAuthorize("hasAuthority('KNOWLEDGE:MANAGE')")
    public ResponseEntity<ApiResponse<KnowledgeCategory>> createCategory(@RequestBody KnowledgeCategory category) {
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", knowledgeService.createCategory(category)));
    }

    @PostMapping("/articles")
    @PreAuthorize("hasAuthority('KNOWLEDGE:MANAGE')")
    public ResponseEntity<ApiResponse<Article>> createArticle(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.krishihub.auth.model.CustomUserDetails userDetails,
            @RequestBody Article article) {
        article.setAuthorId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Article created successfully", knowledgeService.createArticle(article)));
    }

    @PutMapping("/articles/{id}")
    @PreAuthorize("hasAuthority('KNOWLEDGE:MANAGE')")
    public ResponseEntity<ApiResponse<Article>> updateArticle(@PathVariable UUID id, @RequestBody Article article) {
        return ResponseEntity.ok(ApiResponse.success("Article updated successfully", knowledgeService.updateArticle(id, article)));
    }

    @DeleteMapping("/articles/{id}")
    @PreAuthorize("hasAuthority('KNOWLEDGE:MANAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable UUID id) {
        knowledgeService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.success("Article deleted successfully", null));
    }
}

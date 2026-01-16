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
    public ResponseEntity<ApiResponse<List<KnowledgeCategory>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.getAllCategories()));
    }

    @GetMapping("/articles")
    public ResponseEntity<ApiResponse<List<Article>>> getArticles(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status) {

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("undefined")) {
            return ResponseEntity.ok(ApiResponse.success(knowledgeService.getAllArticles(status)));
        }

        UUID catId = null;
        if (categoryId != null && !categoryId.trim().isEmpty() && !categoryId.equalsIgnoreCase("undefined")) {
            try {
                catId = UUID.fromString(categoryId);
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUID
            }
        }

        String cleanTag = (tag != null && !tag.trim().isEmpty() && !tag.equalsIgnoreCase("undefined")) ? tag : null;

        if (catId != null) {
            return ResponseEntity.ok(ApiResponse.success(knowledgeService.getArticlesByCategory(catId)));
        }
        if (cleanTag != null) {
            return ResponseEntity.ok(ApiResponse.success(knowledgeService.getArticlesByTag(cleanTag)));
        }
        return ResponseEntity.ok(ApiResponse.success(knowledgeService.getPublishedArticles()));
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
    public ResponseEntity<ApiResponse<Article>> createArticle(@RequestBody Article article) {
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

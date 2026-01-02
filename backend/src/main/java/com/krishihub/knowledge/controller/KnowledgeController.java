package com.krishihub.knowledge.controller;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.KnowledgeCategory;
import com.krishihub.knowledge.service.KnowledgeService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/knowledge")
@RequiredArgsConstructor
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    // Public Endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<KnowledgeCategory>> getAllCategories() {
        return ResponseEntity.ok(knowledgeService.getAllCategories());
    }

    @GetMapping("/articles")
    public ResponseEntity<List<Article>> getArticles(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status) {

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("undefined")) {
            return ResponseEntity.ok(knowledgeService.getAllArticles(status));
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
            return ResponseEntity.ok(knowledgeService.getArticlesByCategory(catId));
        }
        if (cleanTag != null) {
            return ResponseEntity.ok(knowledgeService.getArticlesByTag(cleanTag));
        }
        return ResponseEntity.ok(knowledgeService.getPublishedArticles());
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<Article> getArticle(@PathVariable String id) {
        UUID articleId;
        try {
            articleId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            // Throw resource not found or bad request if ID is not a UUID
            throw new RuntimeException("Invalid Article ID: " + id);
        }
        return ResponseEntity.ok(knowledgeService.getArticleById(articleId));
    }

    // Admin Endpoints (Ideally secured with PreAuthorize)
    @PostMapping("/categories")
    public ResponseEntity<KnowledgeCategory> createCategory(@RequestBody KnowledgeCategory category) {
        return ResponseEntity.ok(knowledgeService.createCategory(category));
    }

    @PostMapping("/articles")
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        return ResponseEntity.ok(knowledgeService.createArticle(article));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable UUID id, @RequestBody Article article) {
        return ResponseEntity.ok(knowledgeService.updateArticle(id, article));
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable UUID id) {
        knowledgeService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
}

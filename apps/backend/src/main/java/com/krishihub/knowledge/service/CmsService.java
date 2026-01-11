package com.krishihub.knowledge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.krishihub.admin.service.AuditService;
import com.krishihub.knowledge.dto.WorkflowActionRequest;
import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.entity.ArticleVersion;
import com.krishihub.knowledge.entity.ContentWorkflowHistory;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.krishihub.knowledge.repository.ArticleVersionRepository;
import com.krishihub.knowledge.repository.ContentWorkflowHistoryRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CmsService {

    private final ArticleRepository articleRepository;
    private final ContentWorkflowHistoryRepository workflowHistoryRepository;
    private final ArticleVersionRepository articleVersionRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Transactional
    public void performWorkflowAction(UUID articleId, WorkflowActionRequest request, UUID actorId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found"));

        String action = request.getAction().toUpperCase();
        ArticleStatus newStatus;

        switch (action) {
            case "SUBMIT":
                newStatus = ArticleStatus.UNDER_REVIEW;
                break;
            case "APPROVE":
                newStatus = ArticleStatus.APPROVED;
                break;
            case "REJECT":
                newStatus = ArticleStatus.DRAFT;
                break;
            case "PUBLISH":
                newStatus = ArticleStatus.PUBLISHED;
                createVersion(article, actorId);
                break;
            default:
                throw new BadRequestException("Invalid action: " + action);
        }

        // Update status
        ArticleStatus oldStatus = article.getStatus();
        article.setStatus(newStatus);
        articleRepository.save(article);

        // Log Workflow History
        ContentWorkflowHistory history = ContentWorkflowHistory.builder()
                .contentId(articleId)
                .contentType("ARTICLE")
                .actorId(actorId)
                .action(action)
                .comment(request.getComment())
                .build();
        workflowHistoryRepository.save(history);

        // Audit
        auditService.logAction(actorId, "CMS_WORKFLOW_" + action, "ARTICLE", articleId.toString(),
                Map.of("oldStatus", oldStatus, "newStatus", newStatus), "SYSTEM", "INTERNAL");
    }

    private void createVersion(Article article, UUID actorId) {
        int nextVersion = articleVersionRepository.findByArticleIdOrderByVersionNumberDesc(article.getId())
                .stream().findFirst().map(v -> v.getVersionNumber() + 1).orElse(1);

        Map<String, Object> snapshot = objectMapper.convertValue(article, Map.class);

        ArticleVersion version = ArticleVersion.builder()
                .article(article)
                .versionNumber(nextVersion)
                .contentSnapshot(snapshot)
                .createdBy(actorId)
                .build();

        articleVersionRepository.save(version);
    }

    public java.util.List<Article> getAllArticles() {
        return articleRepository.findAll();
    }
}

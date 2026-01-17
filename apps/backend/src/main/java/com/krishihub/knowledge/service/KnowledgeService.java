package com.krishihub.knowledge.service;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.KnowledgeCategory;
import java.util.List;
import java.util.UUID;

public interface KnowledgeService {

    // Categories
    // Categories
    List<KnowledgeCategory> getAllCategories();
    org.springframework.data.domain.Page<KnowledgeCategory> getAllCategories(org.springframework.data.domain.Pageable pageable);

    KnowledgeCategory createCategory(KnowledgeCategory category);

    // Articles
    List<Article> getAllArticles(String status);
    org.springframework.data.domain.Page<Article> getAllArticles(String status, org.springframework.data.domain.Pageable pageable);

    List<Article> getPublishedArticles();
    org.springframework.data.domain.Page<Article> getPublishedArticles(org.springframework.data.domain.Pageable pageable);

    List<Article> getArticlesByCategory(UUID categoryId);
    org.springframework.data.domain.Page<Article> getArticlesByCategory(UUID categoryId, org.springframework.data.domain.Pageable pageable);

    List<Article> getArticlesByTag(String tag);
    org.springframework.data.domain.Page<Article> getArticlesByTag(String tag, org.springframework.data.domain.Pageable pageable);

    Article getArticleById(UUID id);

    Article createArticle(Article article);

    Article updateArticle(UUID id, Article article);

    void deleteArticle(UUID id);
}

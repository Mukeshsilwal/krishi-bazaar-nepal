package com.krishihub.knowledge.service;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.KnowledgeCategory;
import java.util.List;
import java.util.UUID;

public interface KnowledgeService {

    // Categories
    List<KnowledgeCategory> getAllCategories();

    KnowledgeCategory createCategory(KnowledgeCategory category);

    // Articles
    List<Article> getPublishedArticles();

    List<Article> getArticlesByCategory(UUID categoryId);

    List<Article> getArticlesByTag(String tag);

    Article getArticleById(UUID id);

    Article createArticle(Article article);

    Article updateArticle(UUID id, Article article);

    void deleteArticle(UUID id);
}

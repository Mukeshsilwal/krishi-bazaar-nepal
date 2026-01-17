package com.krishihub.knowledge.service;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.ArticleStatus;
import com.krishihub.knowledge.entity.KnowledgeCategory;
import com.krishihub.knowledge.repository.ArticleRepository;
import com.krishihub.knowledge.repository.KnowledgeCategoryRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KnowledgeServiceImpl implements KnowledgeService {

    private final ArticleRepository articleRepository;
    private final KnowledgeCategoryRepository categoryRepository;

    @Override

    public List<KnowledgeCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public org.springframework.data.domain.Page<KnowledgeCategory> getAllCategories(org.springframework.data.domain.Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    @Override
    public KnowledgeCategory createCategory(KnowledgeCategory category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Article> getAllArticles(String status) {
        if (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("ALL")) {
            return articleRepository.findAll();
        }
        try {
            return articleRepository.findByStatus(ArticleStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return articleRepository.findAll();
        }
    }

    @Override
    public org.springframework.data.domain.Page<Article> getAllArticles(String status, org.springframework.data.domain.Pageable pageable) {
        if (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("ALL")) {
            return articleRepository.findAll(pageable);
        }
        try {
            return articleRepository.findByStatus(ArticleStatus.valueOf(status.toUpperCase()), pageable);
        } catch (IllegalArgumentException e) {
            return articleRepository.findAll(pageable);
        }
    }

    @Override
    public List<Article> getPublishedArticles() {
        return articleRepository.findByStatus(ArticleStatus.PUBLISHED);
    }

    @Override
    public org.springframework.data.domain.Page<Article> getPublishedArticles(org.springframework.data.domain.Pageable pageable) {
        return articleRepository.findByStatus(ArticleStatus.PUBLISHED, pageable);
    }

    @Override
    public List<Article> getArticlesByCategory(UUID categoryId) {
        return articleRepository.findByCategoryIdAndStatus(categoryId, ArticleStatus.PUBLISHED);
    }

    @Override
    public org.springframework.data.domain.Page<Article> getArticlesByCategory(UUID categoryId, org.springframework.data.domain.Pageable pageable) {
        return articleRepository.findByCategoryIdAndStatus(categoryId, ArticleStatus.PUBLISHED, pageable);
    }

    @Override
    public List<Article> getArticlesByTag(String tag) {
        return articleRepository.findByTag(tag);
    }

    @Override
    public org.springframework.data.domain.Page<Article> getArticlesByTag(String tag, org.springframework.data.domain.Pageable pageable) {
        return articleRepository.findByTag(tag, pageable);
    }

    @Override
    public Article getArticleById(UUID id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    @Override
    public Article createArticle(Article article) {
        article.setStatus(ArticleStatus.DRAFT);
        return articleRepository.save(article);
    }

    @Override
    public Article updateArticle(UUID id, Article articleDetails) {
        Article article = getArticleById(id);
        article.setTitleEn(articleDetails.getTitleEn());
        article.setTitleNe(articleDetails.getTitleNe());
        article.setContentEn(articleDetails.getContentEn());
        article.setContentNe(articleDetails.getContentNe());
        article.setTags(articleDetails.getTags());
        article.setCategory(articleDetails.getCategory());
        article.setCoverImageUrl(articleDetails.getCoverImageUrl());
        article.setStatus(articleDetails.getStatus());
        return articleRepository.save(article);
    }

    @Override
    public void deleteArticle(UUID id) {
        articleRepository.deleteById(id);
    }
}

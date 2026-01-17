package com.krishihub.knowledge.repository;

import com.krishihub.knowledge.entity.Article;
import com.krishihub.knowledge.entity.ArticleStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    List<Article> findByStatus(ArticleStatus status);
    org.springframework.data.domain.Page<Article> findByStatus(ArticleStatus status, org.springframework.data.domain.Pageable pageable);

    List<Article> findByCategoryIdAndStatus(UUID categoryId, ArticleStatus status);
    org.springframework.data.domain.Page<Article> findByCategoryIdAndStatus(UUID categoryId, ArticleStatus status, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT * FROM articles WHERE :tag = ANY(tags) AND status = 'PUBLISHED'", nativeQuery = true)
    List<Article> findByTag(@Param("tag") String tag);

    @Query(value = "SELECT * FROM articles WHERE :tag = ANY(tags) AND status = 'PUBLISHED'", 
           countQuery = "SELECT count(*) FROM articles WHERE :tag = ANY(tags) AND status = 'PUBLISHED'", 
           nativeQuery = true)
    org.springframework.data.domain.Page<Article> findByTag(@Param("tag") String tag, org.springframework.data.domain.Pageable pageable);

    long countByStatus(ArticleStatus status);
    
    List<com.krishihub.knowledge.entity.Article> findTop5ByOrderByViewsDesc();
    
    boolean existsByExternalId(String externalId);
}

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

    List<Article> findByCategoryIdAndStatus(UUID categoryId, ArticleStatus status);

    @Query(value = "SELECT * FROM articles WHERE :tag = ANY(tags) AND status = 'PUBLISHED'", nativeQuery = true)
    List<Article> findByTag(@Param("tag") String tag);
}

package com.krishihub.knowledge.repository;

import com.krishihub.knowledge.entity.ArticleVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArticleVersionRepository extends JpaRepository<ArticleVersion, UUID> {
    List<ArticleVersion> findByArticleIdOrderByVersionNumberDesc(UUID articleId);

    Optional<ArticleVersion> findByArticleIdAndVersionNumber(UUID articleId, Integer versionNumber);
}

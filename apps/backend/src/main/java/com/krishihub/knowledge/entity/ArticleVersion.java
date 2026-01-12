package com.krishihub.knowledge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "article_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> contentSnapshot; // Complete snapshot of the article data

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private UUID createdBy;

    public static ArticleVersionBuilder builder() {
        return new ArticleVersionBuilder();
    }

    public static class ArticleVersionBuilder {
        private UUID id;
        private Article article;
        private Integer versionNumber;
        private Map<String, Object> contentSnapshot;
        private LocalDateTime createdAt;
        private UUID createdBy;

        ArticleVersionBuilder() {
        }

        public ArticleVersionBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ArticleVersionBuilder article(Article article) {
            this.article = article;
            return this;
        }

        public ArticleVersionBuilder versionNumber(Integer versionNumber) {
            this.versionNumber = versionNumber;
            return this;
        }

        public ArticleVersionBuilder contentSnapshot(Map<String, Object> contentSnapshot) {
            this.contentSnapshot = contentSnapshot;
            return this;
        }

        public ArticleVersionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ArticleVersionBuilder createdBy(UUID createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public ArticleVersion build() {
            return new ArticleVersion(id, article, versionNumber, contentSnapshot, createdAt, createdBy);
        }
    }
}

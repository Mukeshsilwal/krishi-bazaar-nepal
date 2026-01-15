package com.krishihub.knowledge.ingestion;

import com.krishihub.knowledge.source.KnowledgeSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.UUID;

@Entity
@Table(name = "raw_knowledge_content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Immutable // Ensures no updates after insert
public class RawKnowledgeContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "source_id", nullable = false)
    private KnowledgeSource source;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String originalText;

    private String title;

    private String sourceUrl;

    private String author;

    @Column(name = "published_at_source")
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date publishedAtSource;

    @Column(nullable = false, unique = true)
    private String contentHash; // Checksum to prevent duplicates

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date fetchedAt;

    @Enumerated(EnumType.STRING)
    private IngestionStatus status;

    public enum IngestionStatus {
        PENDING_PROCESSING,
        PROCESSED,
        FAILED,
        SKIPPED
    }
}

package com.krishihub.knowledge.ai;

import com.krishihub.knowledge.ingestion.RawKnowledgeContent;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "processed_knowledge")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedKnowledge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "raw_content_id", nullable = false)
    private RawKnowledgeContent rawContent;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String processedContent; // JSON or Markup for the advisory

    private String title;

    private String language; // e.g., "ne" for Nepali

    @Column(columnDefinition = "TEXT")
    private String tags; // JSON array of tags

    @CreationTimestamp
    private LocalDateTime processedAt;

    private String aiModelUsed;

    private boolean isObsolete;
}

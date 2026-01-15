package com.krishihub.legal.entity;

import com.krishihub.shared.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity for storing legal documents like Privacy Policy and Terms of Service.
 * Supports versioning and bilingual content (English/Nepali).
 */
@Entity
@Table(name = "legal_documents")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalDocument extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DocumentType type;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(nullable = false, length = 200)
    private String titleEn;

    @Column(nullable = false, length = 200)
    private String titleNe;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentEn;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentNe;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    public enum DocumentType {
        PRIVACY_POLICY,
        TERMS_OF_SERVICE
    }
}

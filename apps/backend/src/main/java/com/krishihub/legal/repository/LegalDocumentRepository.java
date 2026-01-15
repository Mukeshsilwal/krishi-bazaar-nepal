package com.krishihub.legal.repository;

import com.krishihub.legal.entity.LegalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LegalDocumentRepository extends JpaRepository<LegalDocument, UUID> {

    Optional<LegalDocument> findByTypeAndIsActiveTrue(LegalDocument.DocumentType type);

    List<LegalDocument> findByTypeOrderByEffectiveDateDesc(LegalDocument.DocumentType type);

    Optional<LegalDocument> findByTypeAndVersion(LegalDocument.DocumentType type, String version);

    List<LegalDocument> findAllByOrderByTypeAscEffectiveDateDesc();
}

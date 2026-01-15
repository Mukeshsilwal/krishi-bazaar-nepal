package com.krishihub.legal.service;

import com.krishihub.legal.dto.CreateLegalDocumentRequest;
import com.krishihub.legal.dto.LegalDocumentDto;
import com.krishihub.legal.entity.LegalDocument;
import com.krishihub.legal.repository.LegalDocumentRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LegalDocumentService {

    private final LegalDocumentRepository legalDocumentRepository;

    /**
     * Get the active legal document by type (for public display).
     */
    public LegalDocumentDto getActiveDocument(String typeStr) {
        LegalDocument.DocumentType type = parseDocumentType(typeStr);
        
        LegalDocument document = legalDocumentRepository.findByTypeAndIsActiveTrue(type)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active " + typeStr + " found"));

        return LegalDocumentDto.fromEntity(document);
    }

    /**
     * Get a specific version of a legal document.
     */
    public LegalDocumentDto getDocumentByVersion(String typeStr, String version) {
        LegalDocument.DocumentType type = parseDocumentType(typeStr);
        
        LegalDocument document = legalDocumentRepository.findByTypeAndVersion(type, version)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document not found: " + typeStr + " version " + version));

        return LegalDocumentDto.fromEntity(document);
    }

    /**
     * Get all legal documents (admin only).
     */
    public List<LegalDocumentDto> getAllDocuments() {
        return legalDocumentRepository.findAllByOrderByTypeAscEffectiveDateDesc()
                .stream()
                .map(LegalDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all versions of a specific document type (admin only).
     */
    public List<LegalDocumentDto> getDocumentsByType(String typeStr) {
        LegalDocument.DocumentType type = parseDocumentType(typeStr);
        
        return legalDocumentRepository.findByTypeOrderByEffectiveDateDesc(type)
                .stream()
                .map(LegalDocumentDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new legal document (admin only).
     */
    @Transactional
    public LegalDocumentDto createDocument(CreateLegalDocumentRequest request) {
        LegalDocument.DocumentType type = parseDocumentType(request.getType());

        // Check if version already exists
        legalDocumentRepository.findByTypeAndVersion(type, request.getVersion())
                .ifPresent(existing -> {
                    throw new BadRequestException(
                            "Version " + request.getVersion() + " already exists for " + request.getType());
                });

        // If this is set as active, deactivate other versions
        if (Boolean.TRUE.equals(request.getIsActive())) {
            deactivateAllVersions(type);
        }

        LegalDocument document = LegalDocument.builder()
                .type(type)
                .version(request.getVersion())
                .titleEn(request.getTitleEn())
                .titleNe(request.getTitleNe())
                .contentEn(request.getContentEn())
                .contentNe(request.getContentNe())
                .effectiveDate(request.getEffectiveDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : false)
                .build();

        LegalDocument saved = legalDocumentRepository.save(document);
        log.info("Created legal document: {} version {}", saved.getType(), saved.getVersion());

        return LegalDocumentDto.fromEntity(saved);
    }

    /**
     * Update a legal document (admin only).
     */
    @Transactional
    public LegalDocumentDto updateDocument(UUID id, CreateLegalDocumentRequest request) {
        LegalDocument document = legalDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Legal document not found"));

        LegalDocument.DocumentType type = parseDocumentType(request.getType());

        // If changing version, check if new version already exists
        if (!document.getVersion().equals(request.getVersion())) {
            legalDocumentRepository.findByTypeAndVersion(type, request.getVersion())
                    .ifPresent(existing -> {
                        throw new BadRequestException(
                                "Version " + request.getVersion() + " already exists");
                    });
        }

        // If activating this document, deactivate others
        if (Boolean.TRUE.equals(request.getIsActive()) && !document.getIsActive()) {
            deactivateAllVersions(type);
        }

        document.setType(type);
        document.setVersion(request.getVersion());
        document.setTitleEn(request.getTitleEn());
        document.setTitleNe(request.getTitleNe());
        document.setContentEn(request.getContentEn());
        document.setContentNe(request.getContentNe());
        document.setEffectiveDate(request.getEffectiveDate());
        document.setIsActive(request.getIsActive() != null ? request.getIsActive() : false);

        LegalDocument updated = legalDocumentRepository.save(document);
        log.info("Updated legal document: {} version {}", updated.getType(), updated.getVersion());

        return LegalDocumentDto.fromEntity(updated);
    }

    /**
     * Activate a specific version (admin only).
     */
    @Transactional
    public LegalDocumentDto activateDocument(UUID id) {
        LegalDocument document = legalDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Legal document not found"));

        // Deactivate all other versions of this type
        deactivateAllVersions(document.getType());

        document.setIsActive(true);
        LegalDocument activated = legalDocumentRepository.save(document);
        
        log.info("Activated legal document: {} version {}", activated.getType(), activated.getVersion());

        return LegalDocumentDto.fromEntity(activated);
    }

    /**
     * Delete a legal document (admin only).
     */
    @Transactional
    public void deleteDocument(UUID id) {
        LegalDocument document = legalDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Legal document not found"));

        if (document.getIsActive()) {
            throw new BadRequestException("Cannot delete active document. Please activate another version first.");
        }

        legalDocumentRepository.delete(document);
        log.info("Deleted legal document: {} version {}", document.getType(), document.getVersion());
    }

    /**
     * Deactivate all versions of a document type.
     */
    private void deactivateAllVersions(LegalDocument.DocumentType type) {
        List<LegalDocument> activeDocuments = legalDocumentRepository.findByTypeOrderByEffectiveDateDesc(type)
                .stream()
                .filter(LegalDocument::getIsActive)
                .collect(Collectors.toList());

        for (LegalDocument doc : activeDocuments) {
            doc.setIsActive(false);
            legalDocumentRepository.save(doc);
        }
    }

    /**
     * Parse document type from string.
     */
    private LegalDocument.DocumentType parseDocumentType(String typeStr) {
        try {
            return LegalDocument.DocumentType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid document type: " + typeStr);
        }
    }
}

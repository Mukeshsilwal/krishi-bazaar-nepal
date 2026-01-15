package com.krishihub.legal.controller;

import com.krishihub.legal.dto.CreateLegalDocumentRequest;
import com.krishihub.legal.dto.LegalDocumentDto;
import com.krishihub.legal.service.LegalDocumentService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin API for managing legal documents.
 */
@RestController
@RequestMapping("/api/admin/legal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminLegalDocumentController {

    private final LegalDocumentService legalDocumentService;

    /**
     * Get all legal documents.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LegalDocumentDto>>> getAllDocuments() {
        List<LegalDocumentDto> documents = legalDocumentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Legal documents retrieved successfully", documents));
    }

    /**
     * Get all versions of a specific document type.
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<LegalDocumentDto>>> getDocumentsByType(
            @PathVariable String type) {
        List<LegalDocumentDto> documents = legalDocumentService.getDocumentsByType(type);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    /**
     * Create a new legal document.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LegalDocumentDto>> createDocument(
            @Valid @RequestBody CreateLegalDocumentRequest request) {
        LegalDocumentDto created = legalDocumentService.createDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Legal document created successfully", created));
    }

    /**
     * Update a legal document.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LegalDocumentDto>> updateDocument(
            @PathVariable UUID id,
            @Valid @RequestBody CreateLegalDocumentRequest request) {
        LegalDocumentDto updated = legalDocumentService.updateDocument(id, request);
        return ResponseEntity.ok(ApiResponse.success("Legal document updated successfully", updated));
    }

    /**
     * Activate a specific version.
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<LegalDocumentDto>> activateDocument(@PathVariable UUID id) {
        LegalDocumentDto activated = legalDocumentService.activateDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Legal document activated successfully", activated));
    }

    /**
     * Delete a legal document.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id) {
        legalDocumentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success("Legal document deleted successfully", null));
    }
}

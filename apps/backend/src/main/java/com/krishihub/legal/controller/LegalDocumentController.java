package com.krishihub.legal.controller;

import com.krishihub.legal.dto.LegalDocumentDto;
import com.krishihub.legal.service.LegalDocumentService;
import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public API for accessing legal documents (Privacy Policy, Terms of Service).
 */
@RestController
@RequestMapping("/api/legal")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LegalDocumentController {

    private final LegalDocumentService legalDocumentService;

    /**
     * Get the active Privacy Policy.
     */
    @GetMapping("/privacy-policy")
    public ResponseEntity<ApiResponse<LegalDocumentDto>> getPrivacyPolicy() {
        LegalDocumentDto document = legalDocumentService.getActiveDocument("PRIVACY_POLICY");
        return ResponseEntity.ok(ApiResponse.success("Privacy Policy retrieved successfully", document));
    }

    /**
     * Get the active Terms of Service.
     */
    @GetMapping("/terms-of-service")
    public ResponseEntity<ApiResponse<LegalDocumentDto>> getTermsOfService() {
        LegalDocumentDto document = legalDocumentService.getActiveDocument("TERMS_OF_SERVICE");
        return ResponseEntity.ok(ApiResponse.success("Terms of Service retrieved successfully", document));
    }

    /**
     * Get a specific version of a legal document.
     */
    @GetMapping("/{type}/version/{version}")
    public ResponseEntity<ApiResponse<LegalDocumentDto>> getDocumentByVersion(
            @PathVariable String type,
            @PathVariable String version) {
        LegalDocumentDto document = legalDocumentService.getDocumentByVersion(type, version);
        return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", document));
    }
}

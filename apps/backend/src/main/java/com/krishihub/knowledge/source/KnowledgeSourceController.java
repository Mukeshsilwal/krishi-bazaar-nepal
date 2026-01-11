package com.krishihub.knowledge.source;

import com.krishihub.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge/sources")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')") // TODO: Enable security later
public class KnowledgeSourceController {

    private final KnowledgeSourceService sourceService;

    @PostMapping
    public ResponseEntity<ApiResponse<KnowledgeSource>> createSource(@RequestBody KnowledgeSource source) {
        return ResponseEntity.ok(ApiResponse.success("Source created successfully", sourceService.createSource(source)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<KnowledgeSource>>> getAllSources() {
        return ResponseEntity.ok(ApiResponse.success(sourceService.getAllSources()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeSource>> getSource(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(sourceService.getSourceById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KnowledgeSource>> updateSource(@PathVariable UUID id, @RequestBody KnowledgeSource source) {
        return ResponseEntity.ok(ApiResponse.success("Source updated successfully", sourceService.updateSource(id, source)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<KnowledgeSource>> updateStatus(@PathVariable UUID id,
            @RequestParam KnowledgeSource.SourceStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Source status updated", sourceService.updateStatus(id, status)));
    }

    @PatchMapping("/{id}/trust-score")
    public ResponseEntity<ApiResponse<KnowledgeSource>> updateTrustScore(@PathVariable UUID id, @RequestParam int score) {
        return ResponseEntity.ok(ApiResponse.success("Trust score updated", sourceService.updateTrustScore(id, score)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSource(@PathVariable UUID id) {
        sourceService.deleteSource(id);
        return ResponseEntity.ok(ApiResponse.success("Source deleted successfully", null));
    }
}

package com.krishihub.knowledge.source;

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
    public ResponseEntity<KnowledgeSource> createSource(@RequestBody KnowledgeSource source) {
        return ResponseEntity.ok(sourceService.createSource(source));
    }

    @GetMapping
    public ResponseEntity<List<KnowledgeSource>> getAllSources() {
        return ResponseEntity.ok(sourceService.getAllSources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeSource> getSource(@PathVariable UUID id) {
        return ResponseEntity.ok(sourceService.getSourceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeSource> updateSource(@PathVariable UUID id, @RequestBody KnowledgeSource source) {
        return ResponseEntity.ok(sourceService.updateSource(id, source));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<KnowledgeSource> updateStatus(@PathVariable UUID id,
            @RequestParam KnowledgeSource.SourceStatus status) {
        return ResponseEntity.ok(sourceService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/trust-score")
    public ResponseEntity<KnowledgeSource> updateTrustScore(@PathVariable UUID id, @RequestParam int score) {
        return ResponseEntity.ok(sourceService.updateTrustScore(id, score));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSource(@PathVariable UUID id) {
        sourceService.deleteSource(id);
        return ResponseEntity.noContent().build();
    }
}

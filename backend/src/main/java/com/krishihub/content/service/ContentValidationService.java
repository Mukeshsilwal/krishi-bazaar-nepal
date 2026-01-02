package com.krishihub.content.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.krishihub.content.dto.ContentDTO;
import com.krishihub.content.enums.ContentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class ContentValidationService {

    public void validateContent(ContentDTO content) {
        log.info("Validating content: {}", content.getTitle());

        if (content.getTitle() == null || content.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (content.getContentType() == null) {
            throw new IllegalArgumentException("Content Type is required");
        }
        if (content.getLanguage() == null || content.getLanguage().trim().isEmpty()) {
            throw new IllegalArgumentException("Language is required");
        }

        validateStructuredBody(content.getStructuredBody());
    }

    private void validateStructuredBody(JsonNode body) {
        if (body == null || body.isNull()) {
            throw new IllegalArgumentException("Structured body is required");
        }
        // Add schema validation logic here
        if (!body.isObject()) {
            throw new IllegalArgumentException("Structured body must be a JSON object");
        }
    }

    public void validateTransition(ContentStatus current, ContentStatus next) {
        // Enforce Workflow: DRAFT -> REVIEW -> ACTIVE -> DEPRECATED
        if (current == ContentStatus.DRAFT && next != ContentStatus.REVIEW && next != ContentStatus.DEPRECATED) {
            throw new IllegalStateException("Draft content can only move to Review or Deprecated");
        }
        if (current == ContentStatus.REVIEW && next != ContentStatus.ACTIVE && next != ContentStatus.DRAFT
                && next != ContentStatus.DEPRECATED) {
            throw new IllegalStateException("Content in Review can only move to Active, Draft or Deprecated");
        }
        // ... more rules
    }
}

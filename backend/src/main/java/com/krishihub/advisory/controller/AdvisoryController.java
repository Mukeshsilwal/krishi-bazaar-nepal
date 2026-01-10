package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.AdvisoryResponse;
import com.krishihub.advisory.service.AdvisoryService;
import com.krishihub.shared.dto.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.krishihub.common.context.UserContextHolder;
import java.util.UUID;

@RestController
@RequestMapping("/api/advisory")
@RequiredArgsConstructor
public class AdvisoryController {

    private final AdvisoryService advisoryService;

    @GetMapping("/contextual")
    public ResponseEntity<ApiResponse<List<AdvisoryResponse>>> getAdvisory(
            @RequestParam String context,
            @RequestParam String param) {
        try {
            com.krishihub.advisory.enums.AdvisoryContextType contextType = com.krishihub.advisory.enums.AdvisoryContextType
                    .valueOf(context.toUpperCase());
            return ResponseEntity.ok(ApiResponse.success(advisoryService.getContextualAdvisory(contextType, param)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid context type: " + context));
        }
    }

    @org.springframework.web.bind.annotation.PostMapping("/generate")
    public ResponseEntity<ApiResponse<Void>> generateAdvisoryRules() {
        UUID userId = UserContextHolder.getUserId();
        advisoryService.generateAdvisoryRules(userId);
        return ResponseEntity.ok(ApiResponse.success("Advisory rules generated successfully", null));
    }
}

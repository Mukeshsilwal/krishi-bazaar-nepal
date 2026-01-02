package com.krishihub.ai.controller;

import com.krishihub.ai.entity.AiRecommendation;
import com.krishihub.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import com.krishihub.common.context.UserContextHolder;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/recommendation")
    public ResponseEntity<AiRecommendation> getRecommendation(@RequestBody RecommendationRequest request) {
        UUID farmerId = UserContextHolder.getUserId();
        return ResponseEntity.ok(
                aiService.maximizeCropYield(farmerId, request.query(), request.imageUrl()));
    }

    public record RecommendationRequest(String query, String imageUrl) {
    }
}

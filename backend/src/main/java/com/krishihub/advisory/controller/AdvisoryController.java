package com.krishihub.advisory.controller;

import com.krishihub.advisory.dto.AdvisoryResponse;
import com.krishihub.advisory.service.AdvisoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/advisory")
@RequiredArgsConstructor
public class AdvisoryController {

    private final AdvisoryService advisoryService;

    @GetMapping("/contextual")
    public ResponseEntity<List<AdvisoryResponse>> getAdvisory(
            @RequestParam String context,
            @RequestParam String param) {
        return ResponseEntity.ok(advisoryService.getContextualAdvisory(context, param));
    }
}

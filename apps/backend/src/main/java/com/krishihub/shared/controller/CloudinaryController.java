package com.krishihub.shared.controller;

import com.krishihub.shared.dto.CloudinarySignatureResponse;
import com.krishihub.shared.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/uploads/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {

    private final ImageUploadService imageUploadService;

    @PostMapping("/signature")
    public ResponseEntity<CloudinarySignatureResponse> getUploadSignature(
            @RequestParam(defaultValue = "OTHERS") String uploadType) {
        return ResponseEntity.ok(imageUploadService.generateSignature(uploadType));
    }
}

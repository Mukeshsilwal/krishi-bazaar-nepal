package com.krishihub.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.krishihub.shared.dto.CloudinarySignatureResponse;
import com.krishihub.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageUploadService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret}")
    private String apiSecret;

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    public String uploadImage(MultipartFile file, String folder) {
        validateImage(file);

        try {
            String publicId = folder + "/" + UUID.randomUUID();

            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "krishihub/" + folder,
                            "resource_type", "image",
                            "transformation", ObjectUtils.asMap(
                                    "quality", "auto",
                                    "fetch_format", "auto")));

            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", imageUrl);

            return imageUrl;
        } catch (IOException e) {
            log.error("Failed to upload image: {}", e.getMessage());
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicId(imageUrl);

            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted successfully: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Failed to delete image: {}", e.getMessage());
            // Don't throw exception - just log the error
        }
    }

    public CloudinarySignatureResponse generateSignature(String uploadType) {
        String folder = switch (uploadType) {
            case "DIAGNOSIS" -> "krishihub/diagnosis";
            case "CONTENT" -> "krishihub/content";
            case "PROFILE" -> "krishihub/profile";
            default -> "krishihub/others";
        };

        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, Object> params = new HashMap<>();
        params.put("folder", folder);
        params.put("timestamp", timestamp);

        try {
            // Manual signature generation
            Map<String, Object> sortedParams = new TreeMap<>(params);
            StringBuilder sb = new StringBuilder();
            for (Map.Entry<String, Object> entry : sortedParams.entrySet()) {
                if (entry.getValue() != null) {
                    if (sb.length() > 0)
                        sb.append("&");
                    sb.append(entry.getKey()).append("=").append(entry.getValue());
                }
            }
            sb.append(apiSecret);
            String toSign = sb.toString();

            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(toSign.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : digest) {
                hexString.append(String.format("%02x", b));
            }
            String signature = hexString.toString();

            return CloudinarySignatureResponse.builder()
                    .signature(signature)
                    .timestamp(timestamp)
                    .apiKey(apiKey)
                    .cloudName(cloudName)
                    .folder(folder)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate signature: {}", e.getMessage());
            throw new BadRequestException("Failed to generate upload signature");
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        // Check file size (max 5MB) - Standardized
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Image size must not exceed 5MB");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }

        // Check allowed formats
        if (!contentType.matches("image/(jpeg|jpg|png|webp)")) {
            throw new BadRequestException("Only JPEG, PNG, and WebP images are allowed");
        }
    }

    private String extractPublicId(String imageUrl) {
        try {
            // Extract public_id from Cloudinary URL
            String[] parts = imageUrl.split("/upload/");
            if (parts.length > 1) {
                String pathWithVersion = parts[1];
                // Remove version number (v123/)
                String path = pathWithVersion.replaceFirst("v\\d+/", "");
                // Remove file extension
                return path.replaceFirst("\\.[^.]+$", "");
            }
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", imageUrl);
        }
        return null;
    }
}

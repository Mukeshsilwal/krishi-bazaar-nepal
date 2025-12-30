package com.krishihub.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.krishihub.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageUploadService {

    private final Cloudinary cloudinary;

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

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }

        // Check file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("Image size must not exceed 10MB");
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
            // Example:
            // https://res.cloudinary.com/cloud/image/upload/v123/krishihub/crops/uuid.jpg
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

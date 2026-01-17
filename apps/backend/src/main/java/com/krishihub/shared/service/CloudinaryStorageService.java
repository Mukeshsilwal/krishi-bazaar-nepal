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

/**
 * Dedicated service for Cloudinary storage operations.
 * <p>
 * Responsibilities:
 * - Validate uploaded files (size, format, MIME type)
 * - Upload files to Cloudinary with proper folder structure
 * - Return secure HTTPS URLs
 * - Handle upload exceptions gracefully
 * <p>
 * Design Principles:
 * - Single Responsibility: Only handles Cloudinary operations
 * - No business logic: Validation only
 * - Memory-safe: Uses stream-based uploads (no temp files)
 * - Cloud-compatible: Works on Render/Railway without filesystem access
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;
    
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final String[] ALLOWED_FORMATS = {"image/jpeg", "image/jpg", "image/png", "image/webp"};
    private static final String BASE_FOLDER = "krishi-hub";

    /**
     * Uploads a profile image to Cloudinary.
     * 
     * @param file MultipartFile to upload
     * @param userId User ID for generating unique public ID
     * @return Secure HTTPS URL of uploaded image
     * @throws BadRequestException if validation fails or upload fails
     */
    public String uploadProfileImage(MultipartFile file, String userId) {
        validateFile(file);
        
        String folder = BASE_FOLDER + "/profiles";
        String publicId = String.format("user_%s_%d", userId, System.currentTimeMillis());
        
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folder,
                    "resource_type", "image",
                    "transformation", ObjectUtils.asMap(
                        "quality", "auto",
                        "fetch_format", "auto"
                    )
                )
            );
            
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Profile image uploaded successfully for user {}: {}", userId, secureUrl);
            
            return secureUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload profile image for user {}: {}", userId, e.getMessage(), e);
            throw new BadRequestException("Failed to upload profile image. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error during profile image upload for user {}: {}", userId, e.getMessage(), e);
            throw new BadRequestException("An error occurred while uploading the image.");
        }
    }

    /**
     * Validates uploaded file against size and format constraints.
     * 
     * @param file MultipartFile to validate
     * @throws BadRequestException if validation fails
     */
    private void validateFile(MultipartFile file) {
        // Check if file exists
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Profile image file is required");
        }

        // Check file size (max 2MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Profile image size must not exceed 2MB");
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("Unable to determine file type");
        }

        // Validate allowed formats
        boolean isValidFormat = false;
        for (String allowedFormat : ALLOWED_FORMATS) {
            if (contentType.equalsIgnoreCase(allowedFormat)) {
                isValidFormat = true;
                break;
            }
        }

        if (!isValidFormat) {
            throw new BadRequestException("Invalid image format. Only JPEG, JPG, PNG, and WebP are allowed");
        }

        // Additional validation: check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = getFileExtension(originalFilename).toLowerCase();
            if (!extension.matches("jpg|jpeg|png|webp")) {
                throw new BadRequestException("Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed");
            }
        }
    }

    /**
     * Extracts file extension from filename.
     * 
     * @param filename Original filename
     * @return File extension without dot, or empty string if no extension
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    /**
     * Deletes a profile image from Cloudinary.
     * This is a best-effort operation - failures are logged but not thrown.
     * 
     * @param imageUrl Cloudinary URL to delete
     */
    public void deleteProfileImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Profile image deleted successfully: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Failed to delete profile image {}: {}", imageUrl, e.getMessage());
            // Don't throw - this is a cleanup operation
        }
    }

    /**
     * Extracts Cloudinary public ID from secure URL.
     * 
     * @param imageUrl Cloudinary secure URL
     * @return Public ID or null if extraction fails
     */
    private String extractPublicId(String imageUrl) {
        try {
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

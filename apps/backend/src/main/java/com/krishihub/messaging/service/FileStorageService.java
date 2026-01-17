package com.krishihub.messaging.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling file storage operations for chat attachments.
 * Stores files locally in the configured upload directory.
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:uploads/chat}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Store uploaded file and return its URL
     */
    public FileUploadResult storeFile(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Store file
        Path destinationPath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        // Generate URL
        String fileUrl = baseUrl + "/api/chat/files/" + uniqueFilename;

        log.info("File stored successfully: {} -> {}", originalFilename, uniqueFilename);

        return FileUploadResult.builder()
                .fileUrl(fileUrl)
                .fileName(originalFilename)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .storedFileName(uniqueFilename)
                .build();
    }

    /**
     * Load file from storage
     */
    public Path loadFile(String filename) {
        return Paths.get(uploadDir).resolve(filename).normalize();
    }

    /**
     * Delete file from storage
     */
    public void deleteFile(String filename) throws IOException {
        Path filePath = loadFile(filename);
        Files.deleteIfExists(filePath);
        log.info("File deleted: {}", filename);
    }

    /**
     * Check if file exists
     */
    public boolean fileExists(String filename) {
        Path filePath = loadFile(filename);
        return Files.exists(filePath);
    }

    /**
     * Result object for file upload
     */
    @lombok.Data
    @lombok.Builder
    public static class FileUploadResult {
        private String fileUrl;
        private String fileName;
        private Long fileSize;
        private String fileType;
        private String storedFileName;
    }
}

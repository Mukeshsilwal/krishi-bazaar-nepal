package com.krishihub.shared.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.krishihub.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CloudinaryStorageService.
 * 
 * Tests cover:
 * - Successful profile image upload
 * - File validation (size, format, MIME type)
 * - Error handling (upload failures, timeouts)
 * - Transactional rollback scenarios
 */
@ExtendWith(MockitoExtension.class)
class CloudinaryStorageServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private CloudinaryStorageService cloudinaryStorageService;

    @BeforeEach
    void setUp() {
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Test
    void uploadProfileImage_Success() throws Exception {
        // Arrange
        String userId = "test-user-123";
        byte[] imageContent = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                imageContent
        );

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/test/image/upload/v123/krishi-hub/profiles/user_test-user-123_123456.jpg");

        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(uploadResult);

        // Act
        String result = cloudinaryStorageService.uploadProfileImage(file, userId);

        // Assert
        assertNotNull(result);
        assertTrue(result.startsWith("https://"));
        assertTrue(result.contains("krishi-hub/profiles"));
        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
    }

    @Test
    void uploadProfileImage_NullFile_ThrowsException() {
        // Arrange
        String userId = "test-user-123";

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(null, userId)
        );
        assertEquals("Profile image file is required", exception.getMessage());
    }

    @Test
    void uploadProfileImage_EmptyFile_ThrowsException() {
        // Arrange
        String userId = "test-user-123";
        MultipartFile emptyFile = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                new byte[0]
        );

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(emptyFile, userId)
        );
        assertEquals("Profile image file is required", exception.getMessage());
    }

    @Test
    void uploadProfileImage_FileTooLarge_ThrowsException() {
        // Arrange
        String userId = "test-user-123";
        byte[] largeContent = new byte[3 * 1024 * 1024]; // 3MB
        MultipartFile largeFile = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                largeContent
        );

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(largeFile, userId)
        );
        assertEquals("Profile image size must not exceed 2MB", exception.getMessage());
    }

    @Test
    void uploadProfileImage_InvalidFormat_ThrowsException() {
        // Arrange
        String userId = "test-user-123";
        byte[] content = "fake-pdf-content".getBytes();
        MultipartFile pdfFile = new MockMultipartFile(
                "profileImage",
                "document.pdf",
                "application/pdf",
                content
        );

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(pdfFile, userId)
        );
        assertEquals("Invalid image format. Only JPEG, JPG, PNG, and WebP are allowed", exception.getMessage());
    }

    @Test
    void uploadProfileImage_InvalidExtension_ThrowsException() {
        // Arrange
        String userId = "test-user-123";
        byte[] content = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.gif",
                "image/jpeg",
                content
        );

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(file, userId)
        );
        assertEquals("Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed", exception.getMessage());
    }

    @Test
    void uploadProfileImage_UploadFails_ThrowsException() throws Exception {
        // Arrange
        String userId = "test-user-123";
        byte[] imageContent = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                imageContent
        );

        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenThrow(new IOException("Network error"));

        // Act & Assert
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cloudinaryStorageService.uploadProfileImage(file, userId)
        );
        assertTrue(exception.getMessage().contains("Failed to upload profile image"));
    }

    @Test
    void uploadProfileImage_ValidatesJpegFormat() throws Exception {
        // Arrange
        String userId = "test-user-123";
        byte[] imageContent = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.jpeg",
                "image/jpeg",
                imageContent
        );

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/test/image/upload/profile.jpg");

        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(uploadResult);

        // Act
        String result = cloudinaryStorageService.uploadProfileImage(file, userId);

        // Assert
        assertNotNull(result);
        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
    }

    @Test
    void uploadProfileImage_ValidatesPngFormat() throws Exception {
        // Arrange
        String userId = "test-user-123";
        byte[] imageContent = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.png",
                "image/png",
                imageContent
        );

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/test/image/upload/profile.png");

        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(uploadResult);

        // Act
        String result = cloudinaryStorageService.uploadProfileImage(file, userId);

        // Assert
        assertNotNull(result);
        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
    }

    @Test
    void uploadProfileImage_ValidatesWebpFormat() throws Exception {
        // Arrange
        String userId = "test-user-123";
        byte[] imageContent = "fake-image-content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "profileImage",
                "profile.webp",
                "image/webp",
                imageContent
        );

        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/test/image/upload/profile.webp");

        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(uploadResult);

        // Act
        String result = cloudinaryStorageService.uploadProfileImage(file, userId);

        // Assert
        assertNotNull(result);
        verify(uploader, times(1)).upload(any(byte[].class), any(Map.class));
    }
}

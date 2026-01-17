package com.krishihub.auth;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.shared.service.CloudinaryStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration test for user registration with profile image upload.
 * 
 * Tests the complete flow:
 * 1. User submits registration with profile image
 * 2. Image is uploaded to Cloudinary (mocked)
 * 3. User record is created with profile image URL
 * 4. Database contains correct data
 * 5. Transactional rollback on upload failure
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class RegistrationWithProfileImageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CloudinaryStorageService cloudinaryStorageService;

    @Test
    void registerUser_WithProfileImage_Success() throws Exception {
        // Arrange
        String testImageUrl = "https://res.cloudinary.com/test/image/upload/v123/krishi-hub/profiles/user_123.jpg";
        when(cloudinaryStorageService.uploadProfileImage(any(), anyString()))
                .thenReturn(testImageUrl);

        MockMultipartFile profileImage = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                "fake-image-content".getBytes()
        );

        // Act & Assert
        mockMvc.perform(multipart("/api/auth/register")
                        .file(profileImage)
                        .param("name", "Test Farmer")
                        .param("email", "farmer@test.com")
                        .param("mobileNumber", "9841234567")
                        .param("role", "FARMER")
                        .param("district", "Kathmandu")
                        .param("ward", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.data").exists());

        // Verify database record
        Optional<User> savedUser = userRepository.findByMobileNumber("+9779841234567");
        assertTrue(savedUser.isPresent());
        assertEquals("Test Farmer", savedUser.get().getName());
        assertEquals("farmer@test.com", savedUser.get().getEmail());
        assertEquals(testImageUrl, savedUser.get().getProfileImageUrl());
    }

    @Test
    void registerUser_WithoutProfileImage_Success() throws Exception {
        // Act & Assert
        mockMvc.perform(multipart("/api/auth/register")
                        .param("name", "Test Buyer")
                        .param("email", "buyer@test.com")
                        .param("mobileNumber", "9851234567")
                        .param("role", "BUYER")
                        .param("district", "Lalitpur")
                        .param("ward", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"));

        // Verify database record
        Optional<User> savedUser = userRepository.findByMobileNumber("+9779851234567");
        assertTrue(savedUser.isPresent());
        assertEquals("Test Buyer", savedUser.get().getName());
        assertNull(savedUser.get().getProfileImageUrl());
    }

    @Test
    void registerUser_ImageUploadFails_RollbackTransaction() throws Exception {
        // Arrange
        when(cloudinaryStorageService.uploadProfileImage(any(), anyString()))
                .thenThrow(new RuntimeException("Cloudinary upload failed"));

        MockMultipartFile profileImage = new MockMultipartFile(
                "profileImage",
                "profile.jpg",
                "image/jpeg",
                "fake-image-content".getBytes()
        );

        // Act & Assert
        mockMvc.perform(multipart("/api/auth/register")
                        .file(profileImage)
                        .param("name", "Test Vendor")
                        .param("email", "vendor@test.com")
                        .param("mobileNumber", "9861234567")
                        .param("role", "VENDOR")
                        .param("district", "Bhaktapur")
                        .param("ward", "7"))
                .andExpect(status().isBadRequest());

        // Verify user was NOT created (transaction rolled back)
        Optional<User> savedUser = userRepository.findByMobileNumber("+9779861234567");
        assertFalse(savedUser.isPresent());
    }

    @Test
    void registerUser_InvalidImageFormat_ReturnsError() throws Exception {
        // Arrange
        MockMultipartFile invalidFile = new MockMultipartFile(
                "profileImage",
                "document.pdf",
                "application/pdf",
                "fake-pdf-content".getBytes()
        );

        when(cloudinaryStorageService.uploadProfileImage(any(), anyString()))
                .thenThrow(new com.krishihub.shared.exception.BadRequestException(
                        "Invalid image format. Only JPEG, JPG, PNG, and WebP are allowed"));

        // Act & Assert
        mockMvc.perform(multipart("/api/auth/register")
                        .file(invalidFile)
                        .param("name", "Test User")
                        .param("email", "user@test.com")
                        .param("mobileNumber", "9871234567")
                        .param("role", "FARMER")
                        .param("district", "Pokhara")
                        .param("ward", "2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ERROR"));
    }
}

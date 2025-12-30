package com.krishihub.auth.controller;

import com.krishihub.auth.dto.*;
import com.krishihub.auth.service.AuthService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest request) {
        String message = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Verification successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        String mobileNumber = authentication.getName();
        UserDto user = authService.getCurrentUser(mobileNumber);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        String mobileNumber = authentication.getName();
        UserDto user = authService.updateProfile(mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
    }
}

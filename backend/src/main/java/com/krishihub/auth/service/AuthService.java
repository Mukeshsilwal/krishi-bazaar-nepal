package com.krishihub.auth.service;

import com.krishihub.auth.dto.*;
import com.krishihub.auth.entity.OtpVerification;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.OtpVerificationRepository;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.auth.security.JwtUtil;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final SmsService smsService;

    @Value("${app.otp.expiration}")
    private int otpExpiration;

    @Value("${app.otp.length}")
    private int otpLength;

    @Transactional
    public String register(RegisterRequest request) {
        // Normalize mobile number
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        // Check if user already exists
        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new BadRequestException("User with this mobile number already exists");
        }

        // Validate role
        User.UserRole role;
        try {
            role = User.UserRole.valueOf(request.getRole().toUpperCase());
            if (role == User.UserRole.ADMIN) {
                throw new BadRequestException("Admin registration is not allowed publicly.");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be FARMER, BUYER, or VENDOR");
        }

        // Create user
        User user = User.builder()
                .mobileNumber(mobileNumber)
                .name(request.getName())
                .role(role)
                .district(request.getDistrict())
                .ward(request.getWard())
                .verified(false)
                .build();

        // Set land size for farmers
        if (role == User.UserRole.FARMER && request.getLandSize() != null) {
            try {
                user.setLandSize(new BigDecimal(request.getLandSize()));
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid land size format");
            }
        }

        userRepository.save(user);

        // Generate and send OTP
        String otp = generateOtp();
        saveOtp(mobileNumber, otp);
        smsService.sendOtp(mobileNumber, otp);

        log.info("User registered successfully: {}", mobileNumber);
        return "OTP sent to " + mobileNumber;
    }

    @Transactional
    public String login(LoginRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        // Check if user exists
        if (!userRepository.existsByMobileNumber(mobileNumber)) {
            throw new ResourceNotFoundException("User not found with mobile number: " + mobileNumber);
        }

        // Generate and send OTP
        String otp = generateOtp();
        saveOtp(mobileNumber, otp);
        smsService.sendOtp(mobileNumber, otp);

        log.info("OTP sent for login: {}", mobileNumber);
        return "OTP sent to " + mobileNumber;
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        // Find latest OTP
        OtpVerification otpVerification = otpRepository
                .findTopByMobileNumberAndVerifiedFalseOrderByCreatedAtDesc(mobileNumber)
                .orElseThrow(() -> new BadRequestException("No OTP found for this mobile number"));

        // Check if OTP is expired
        if (otpVerification.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one");
        }

        // Verify OTP
        if (!otpVerification.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        // Mark OTP as verified
        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);

        // Mark user as verified
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }

        // Generate JWT tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(mobileNumber);
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        log.info("User verified and logged in: {}", mobileNumber);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    public UserDto getCurrentUser(String mobileNumber) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(String mobileNumber, UpdateProfileRequest request) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getDistrict() != null) {
            user.setDistrict(request.getDistrict());
        }
        if (request.getWard() != null) {
            user.setWard(request.getWard());
        }
        if (request.getLandSize() != null && user.getRole() == User.UserRole.FARMER) {
            user.setLandSize(new BigDecimal(request.getLandSize()));
        }

        userRepository.save(user);
        log.info("Profile updated: {}", mobileNumber);

        return UserDto.fromEntity(user);
    }

    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void saveOtp(String mobileNumber, String otp) {
        OtpVerification otpVerification = OtpVerification.builder()
                .mobileNumber(mobileNumber)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusSeconds(otpExpiration))
                .verified(false)
                .build();

        otpRepository.save(otpVerification);
    }

    private String normalizeMobileNumber(String mobileNumber) {
        // Remove spaces and special characters
        String normalized = mobileNumber.replaceAll("[^0-9+]", "");

        // If starts with +977, keep it
        if (normalized.startsWith("+977")) {
            return normalized;
        }

        // If starts with 977, add +
        if (normalized.startsWith("977")) {
            return "+" + normalized;
        }

        // If 10 digits, add +977
        if (normalized.length() == 10) {
            return "+977" + normalized;
        }

        return normalized;
    }
}

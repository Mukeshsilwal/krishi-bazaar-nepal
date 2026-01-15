package com.krishihub.auth.service;

import com.krishihub.analytics.event.ActivityEvent;
import com.krishihub.common.util.DateTimeProvider;
import org.springframework.context.ApplicationEventPublisher;

import com.krishihub.auth.dto.*;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.auth.security.JwtUtil;
import com.krishihub.notification.dto.MessageRequest;
import com.krishihub.notification.enums.MessageType;
import com.krishihub.notification.service.NotificationOrchestrator;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Handles user authentication and registration for all user types.
 *
 * Design Notes:
 * - Supports passwordless OTP-based authentication for farmers, buyers, and vendors.
 * - Supports password-based authentication for admin users only.
 * - Uses email as primary OTP delivery channel with SMS fallback.
 * - Enforces single active session per user via SessionManagementService.
 *
 * Business Rules:
 * - Admin role cannot be registered via public API (requires secret key).
 * - Only admins can use password-based login and forgot password flow.
 * - Mobile numbers are normalized to +977 format for Nepal.
 * - Email and mobile number must be unique across all users.
 *
 * Security:
 * - OTP values are NEVER logged in production.
 * - Session locks prevent concurrent logins across devices.
 * - All authentication failures throw user-safe exception messages.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService; // Decomposed Service
    private final SessionManagementService sessionManagementService; // Decomposed Service
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    // SmsService dependency removed
    private final NotificationOrchestrator notificationOrchestrator;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public String register(RegisterRequest request) {
        log.info("AuthService: Register request received for mobile: {}", request.getMobileNumber());
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new BadRequestException("User with this mobile number already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("User with this email already exists");
        }

        User.UserRole role;
        try {
            role = User.UserRole.valueOf(request.getRole().toUpperCase());
            if (role == User.UserRole.ADMIN) {
                throw new BadRequestException("Admin registration is not allowed publicly.");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role. Must be FARMER, BUYER, or VENDOR");
        }

        User user = User.builder()
                .mobileNumber(mobileNumber)
                .email(request.getEmail())
                .name(request.getName())
                .role(role)
                .district(request.getDistrict())
                .ward(request.getWard())
                .verified(false)
                .build();

        if (role == User.UserRole.FARMER && request.getLandSize() != null) {
            try {
                user.setLandSize(new BigDecimal(request.getLandSize()));
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid land size format");
            }
        }

        userRepository.save(user);

        // Email is preferred delivery channel for OTP (cheaper than SMS)
        // SMS is used as fallback if email delivery fails
        String otp = otpService.generateOtp();
        otpService.saveOtp(mobileNumber, otp);

        try {
            MessageRequest emailRequest = MessageRequest.builder()
                    .type(MessageType.EMAIL)
                    .recipient(request.getEmail())
                    .subject("Registration OTP")
                    .content("Your OTP for registration is: " + otp)
                    .build();
            notificationOrchestrator.send(emailRequest);
            log.info("Registration OTP sent to email {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email OTP", e);
            sendSmsOtp(mobileNumber, otp);
        }
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "REGISTER", "User registered via " + request.getMobileNumber(), null));

        log.info("User registered successfully: {}", mobileNumber);
        return "OTP sent to " + mobileNumber;
    }

    @Transactional
    public String login(LoginRequest request) {
        log.info("AuthService: Login request received for identifier: {}", request.getIdentifier());
        String identifier = request.getIdentifier();
        User user;

        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + identifier));
        } else {
            String mobile = normalizeMobileNumber(identifier);
            user = userRepository.findByMobileNumber(mobile)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with mobile number: " + mobile));
        }

        String mobileNumber = user.getMobileNumber();
        String otp = otpService.generateOtp();
        otpService.saveOtp(mobileNumber, otp);

        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            try {
                MessageRequest emailRequest = MessageRequest.builder()
                        .type(MessageType.EMAIL)
                        .recipient(user.getEmail())
                        .subject("Login OTP")
                        .content("Your OTP for login is: " + otp)
                        .build();
                notificationOrchestrator.send(emailRequest);
                log.info("Login OTP sent to email {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send login email OTP to {}", user.getEmail(), e);
                sendSmsOtp(mobileNumber, otp);
            }
        } else {
            sendSmsOtp(mobileNumber, otp);
        }

        log.info("OTP sent for login: {}", mobileNumber);
        return "OTP sent to " + mobileNumber;
    }

    @Value("${app.admin.secret-key:test}")
    private String adminSecretKey;

    /**
     * Registers a new admin user (requires secret key).
     * <p>
     * Business Rule:
     * - Admin registration is protected by a secret key to prevent unauthorized access.
     * - Admins use password-based authentication instead of OTP.
     * - Admins are marked as verified immediately upon registration.
     * <p>
     * Security:
     * - Secret key must be configured in application properties.
     * - This endpoint should be restricted to internal networks in production.
     */
    @Transactional
    public String registerAdmin(AdminRegisterRequest request) {
        if (!request.getAdminSecret().equals(adminSecretKey)) {
            throw new BadRequestException("Invalid Admin Secret Key");
        }

        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new BadRequestException("User with this mobile number already exists");
        }

        User user = User.builder()
                .mobileNumber(mobileNumber)
                .email(request.getEmail())
                .name(request.getName())
                .role(User.UserRole.ADMIN)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .verified(true)
                .district("Headquarters")
                .ward("0")
                .ward("0")
                .createdAt(DateTimeProvider.now())
                .build();

        userRepository.save(user);
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "ADMIN_REGISTER", "Admin registered: " + user.getName(), null));
        
        log.info("Admin registered successfully: {}", mobileNumber);
        return "Admin registered successfully";
    }

    @Transactional
    public AuthResponse loginAdmin(AdminLoginRequest request) {
        User user;
        if (request.getIdentifier().contains("@")) {
             user = userRepository.findByEmail(request.getIdentifier())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        } else {
             user = userRepository.findByMobileNumber(normalizeMobileNumber(request.getIdentifier()))
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        }

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("User is not an admin");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getMobileNumber());
        String accessToken = jwtUtil.generateToken(userDetails);
        com.krishihub.auth.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "ADMIN_LOGIN", "Admin logged in via " + request.getIdentifier(), null));

        log.info("Admin logged in: {}", user.getMobileNumber());

        sessionManagementService.checkAndSetLoginLock(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String identifier = request.getIdentifier();
        String mobileNumber;

        if (identifier.contains("@")) {
            User user = userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new BadRequestException("User not found with provided email"));
            mobileNumber = user.getMobileNumber();
        } else {
            mobileNumber = normalizeMobileNumber(identifier);
        }

        otpService.verifyOtp(mobileNumber, request.getOtp());

        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getVerified()) {
            user.setVerified(true);
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(mobileNumber);
        String accessToken = jwtUtil.generateToken(userDetails);
        com.krishihub.auth.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        try {
            eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "LOGIN_VERIFY", "User logged in via OTP", null));
        } catch (Exception e) {
            log.error("Failed to publish activity event", e);
        }

        // CRITICAL: Session lock must be set AFTER successful OTP verification
        // to prevent concurrent logins from multiple devices/browsers.
        // If this check throws ActiveSessionExistsException, the user must logout
        // from other devices first.
        sessionManagementService.checkAndSetLoginLock(user.getId());

        log.info("User verified and logged in: {}", mobileNumber);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
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
        log.info("Profile updated: {}", userId);

        return UserDto.fromEntity(user);
    }

    /**
     * Initiates password reset flow (admin users only).
     *
     * Business Rule:
     * - Only admins have passwords, so forgot password is restricted to admins.
     * - Regular users (farmers, buyers, vendors) use passwordless OTP login.
     * - This prevents non-admin users from attempting password recovery.
     */
    @Transactional
    public String initiateForgotPassword(ForgotPasswordRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("Forgot password is only available for Admins");
        }

        String otp = otpService.generateOtp();
        otpService.saveOtp(mobileNumber, otp);

        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            try {
                MessageRequest emailRequest = MessageRequest.builder()
                        .type(MessageType.EMAIL)
                        .recipient(user.getEmail())
                        .subject("Password Reset OTP")
                        .content("Your OTP is: " + otp)
                        .build();
                notificationOrchestrator.send(emailRequest);
                log.info("Forgot password OTP sent to email {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send forgot password email", e);
            }
        } else {
            sendSmsOtp(mobileNumber, otp);
            log.info("Forgot password OTP sent to mobile {}", mobileNumber);
        }

        return "OTP sent successfully";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        otpService.verifyOtp(mobileNumber, request.getOtp());

        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successfully for {}", mobileNumber);
        return "Password reset successfully";
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.krishihub.auth.entity.RefreshToken::getUser)
                .map(user -> {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(user.getMobileNumber());
                    String token = jwtUtil.generateToken(userDetails);
                    return AuthResponse.builder()
                            .accessToken(token)
                            .refreshToken(requestRefreshToken)
                            .tokenType("Bearer")
                            .user(UserDto.fromEntity(user))
                            .build();
                })
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token is not in database!"));
    }

    private void sendSmsOtp(String mobileNumber, String otp) {
        String message = String.format("Your Kisan Sarathi verification code is: %s. Valid for 5 minutes.", otp);
        try {
            notificationOrchestrator.send(MessageRequest.builder()
                    .type(MessageType.SMS)
                    .recipient(mobileNumber)
                    .content(message)
                    .build());
        } catch (Exception e) {
            log.error("Failed to send SMS OTP to {}", mobileNumber, e);
        }
    }

    /**
     * Normalizes mobile numbers to +977 format for Nepal.
     *
     * Business Rule:
     * - All mobile numbers are stored in international format (+977XXXXXXXXXX).
     * - This ensures consistency across SMS delivery, OTP verification, and user lookup.
     * - Supports input formats: +977XXXXXXXXXX, 977XXXXXXXXXX, or XXXXXXXXXX.
     */
    private String normalizeMobileNumber(String mobileNumber) {
        String normalized = mobileNumber.replaceAll("[^0-9+]", "");
        if (normalized.startsWith("+977")) {
            return normalized;
        }
        if (normalized.startsWith("977")) {
            return "+" + normalized;
        }
        if (normalized.length() == 10) {
            return "+977" + normalized;
        }
        return normalized;
    }

    public void logout(UUID userId) {
        sessionManagementService.logout(userId);
    }
}

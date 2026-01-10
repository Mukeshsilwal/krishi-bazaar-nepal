package com.krishihub.auth.service;

import com.krishihub.analytics.event.ActivityEvent;
import org.springframework.context.ApplicationEventPublisher;

import com.krishihub.auth.dto.*;
import com.krishihub.auth.entity.OtpVerification;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.OtpVerificationRepository;
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
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.krishihub.shared.exception.ActiveSessionExistsException;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final SmsService smsService;
    private final NotificationOrchestrator notificationOrchestrator;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;
    private final RefreshTokenService refreshTokenService;
    private final StringRedisTemplate redisTemplate; // Redis Lock

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${app.otp.expiration}")
    private int otpExpiration;

    @Value("${app.otp.length}")
    private int otpLength;

    @Transactional
    public String register(RegisterRequest request) {
        log.info("AuthService: Register request received for mobile: {}", request.getMobileNumber());
        // Normalize mobile number
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        // Check if user already exists
        if (userRepository.existsByMobileNumber(mobileNumber)) {
            throw new BadRequestException("User with this mobile number already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("User with this email already exists");
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
                .email(request.getEmail())
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

        // Send OTP via Email
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
            // Fallback to SMS if email fails? Or just log error?
            // For now fallback to SMS as backup
            smsService.sendOtp(mobileNumber, otp);
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

        // Generate and send OTP
        String otp = generateOtp();
        saveOtp(mobileNumber, otp);

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
                smsService.sendOtp(mobileNumber, otp);
            }
        } else {
            smsService.sendOtp(mobileNumber, otp);
        }

        log.info("OTP sent for login: {}", mobileNumber);
        return "OTP sent to " + mobileNumber;
    }

    @Value("${app.admin.secret-key:test}")
    private String adminSecretKey;

    @Transactional
    public String registerAdmin(AdminRegisterRequest request) {
        // Validate Secret Key
        if (!request.getAdminSecret().equals(adminSecretKey)) {
            throw new BadRequestException("Invalid Admin Secret Key");
        }

        // Normalize mobile
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
                .verified(true) // Admins are auto-verified by secret
                .district("Headquarters")
                .ward("0")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "ADMIN_REGISTER", "Admin registered: " + user.getName(), null));
        
        log.info("Admin registered successfully: {}", mobileNumber);
        return "Admin registered successfully";
    }

    @Transactional
    public AuthResponse loginAdmin(AdminLoginRequest request) {
        // Normalize mobile number (if used as identifier) or check email
        User user;
        if (request.getIdentifier().contains("@")) {
             user = userRepository.findByEmail(request.getIdentifier())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        } else {
             user = userRepository.findByMobileNumber(normalizeMobileNumber(request.getIdentifier()))
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        }

        // Check if user is admin
        if (user.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("User is not an admin");
        }

        // Verify password
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        // Generate JWT tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getMobileNumber());
        String accessToken = jwtUtil.generateToken(userDetails);
        com.krishihub.auth.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "ADMIN_LOGIN", "Admin logged in via " + request.getIdentifier(), null));

        log.info("Admin logged in: {}", user.getMobileNumber());

        // Enforce Single Login
        checkAndSetLoginLock(user.getId());

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
        com.krishihub.auth.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        eventPublisher.publishEvent(new ActivityEvent(this, user.getId(), "LOGIN_VERIFY", "User logged in via OTP", null));

        // Enforce Single Login
        checkAndSetLoginLock(user.getId());

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

    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void saveOtp(String mobileNumber, String otp) {
        log.info("=== DEVELOPMENT OTP for {}: {} ===", mobileNumber, otp);
        OtpVerification otpVerification = OtpVerification.builder()
                .mobileNumber(mobileNumber)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusSeconds(otpExpiration))
                .verified(false)
                .build();

        otpRepository.save(otpVerification);
    }

    @Transactional
    public String initiateForgotPassword(ForgotPasswordRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("Forgot password is only available for Admins");
        }

        String otp = generateOtp();
        saveOtp(mobileNumber, otp);

        // Send OTP via Email if available
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
            // Fallback to SMS or simulated SMS
            smsService.sendOtp(mobileNumber, otp);
            log.info("Forgot password OTP sent to mobile {}", mobileNumber);
        }

        return "OTP sent successfully";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        String mobileNumber = normalizeMobileNumber(request.getMobileNumber());

        // Verify OTP
        OtpVerification otpVerification = otpRepository
                .findTopByMobileNumberAndVerifiedFalseOrderByCreatedAtDesc(mobileNumber)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        if (otpVerification.isExpired()) {
            throw new BadRequestException("OTP has expired");
        }

        if (!otpVerification.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        // Mark OTP as used
        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);

        // Update Password
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

    private void checkAndSetLoginLock(UUID userId) {
        String key = "login:lock:" + userId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
             throw new ActiveSessionExistsException("User is already logged in on another device.");
        }
        redisTemplate.opsForValue().set(key, "true", jwtExpiration, TimeUnit.MILLISECONDS);
    }

    @Transactional
    public void logout(UUID userId) {
        String key = "login:lock:" + userId;
        redisTemplate.delete(key);
        log.info("User logged out, lock released: {}", userId);
    }
}

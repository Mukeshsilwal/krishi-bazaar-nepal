package com.krishihub.auth.service;

import com.krishihub.auth.entity.OtpVerification;
import com.krishihub.auth.repository.OtpVerificationRepository;
import com.krishihub.service.SystemConfigService;
import com.krishihub.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

/**
 * Handles OTP generation, storage, and verification for passwordless authentication.
 *
 * Design Notes:
 * - OTP length and validity are configurable via SystemConfigService to support
 *   different security requirements across environments (dev vs production).
 * - Default validity is 5 minutes (300 seconds) to balance security and user experience.
 * - Only the most recent unverified OTP is considered valid to prevent replay attacks.
 * - Once verified, OTPs are marked as used and cannot be reused.
 *
 * Security:
 * - NEVER log the actual OTP value in production (only in debug mode).
 * - OTP verification is case-sensitive and must match exactly.
 * - Expired OTPs are rejected even if the code matches.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final SystemConfigService systemConfigService;

    /**
     * Generates a random numeric OTP.
     *
     * Business Rule:
     * - OTP length is configurable (default: 6 digits) to support different
     *   security policies. Longer OTPs provide better security but worse UX.
     * - Uses numeric-only format for easier input on mobile devices.
     */
    public String generateOtp() {
        int length = systemConfigService.getInt("auth.otp.length", 6);
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Stores OTP in database with expiration timestamp.
     *
     * Business Rule:
     * - Default validity is 5 minutes (300 seconds) to balance security and UX.
     * - Multiple OTPs can exist for the same mobile number, but only the most
     *   recent unverified one is considered valid during verification.
     *
     * Security:
     * - NEVER log the actual OTP value in production environments.
     * - Debug logging is intentionally limited to mobile number only.
     */
    @Transactional
    public void saveOtp(String mobileNumber, String otp) {
        log.debug("Saving OTP for {}", mobileNumber);
        int validity = systemConfigService.getInt("auth.otp.validity_sec", 300);
        OtpVerification otpVerification = OtpVerification.builder()
                .mobileNumber(mobileNumber)
                .otp(otp)
                .expiresAt(new java.util.Date(System.currentTimeMillis() + (validity * 1000L)))
                .verified(false)
                .build();

        otpRepository.save(otpVerification);
    }

    /**
     * Verifies OTP for a given mobile number.
     *
     * Business Rule:
     * - Only the most recent unverified OTP is considered valid.
     * - Older OTPs are ignored even if they haven't expired yet.
     * - This prevents users from using old OTPs after requesting new ones.
     *
     * Security:
     * - Expiration check happens BEFORE code comparison to prevent timing attacks.
     * - OTP is marked as verified immediately to prevent reuse.
     * - All validation failures throw BadRequestException with user-safe messages.
     */
    @Transactional
    public void verifyOtp(String mobileNumber, String otp) {
        OtpVerification otpVerification = otpRepository
                .findTopByMobileNumberAndVerifiedFalseOrderByCreatedAtDesc(mobileNumber)
                .orElseThrow(() -> new BadRequestException("No OTP found for this mobile number"));

        if (otpVerification.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one");
        }

        if (!otpVerification.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        otpVerification.setVerified(true);
        otpRepository.save(otpVerification);
    }
}

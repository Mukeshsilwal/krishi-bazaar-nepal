package com.krishihub.auth.service;

import com.krishihub.auth.entity.OtpVerification;
import com.krishihub.auth.repository.OtpVerificationRepository;
import com.krishihub.service.SystemConfigService;
import com.krishihub.shared.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final SystemConfigService systemConfigService;

    public String generateOtp() {
        int length = systemConfigService.getInt("auth.otp.length", 6);
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Transactional
    public void saveOtp(String mobileNumber, String otp) {
        // Log is already handled in SmsService or higher levels or here if needed (DEV only)
        log.debug("Saving OTP for {}", mobileNumber); 
        int validity = systemConfigService.getInt("auth.otp.validity_sec", 300);
        OtpVerification otpVerification = OtpVerification.builder()
                .mobileNumber(mobileNumber)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusSeconds(validity))
                .verified(false)
                .build();

        otpRepository.save(otpVerification);
    }

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

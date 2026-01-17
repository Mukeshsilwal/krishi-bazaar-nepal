package com.krishihub.admin.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationHealthService {

    private final com.krishihub.config.properties.OpenAiProperties openAiProperties;
    private final com.krishihub.config.properties.CloudinaryProperties cloudinaryProperties;
    private final com.krishihub.config.properties.PaymentProperties paymentProperties;
    private final com.krishihub.config.properties.SmsProperties smsProperties;
    private final com.krishihub.config.TwilioConfig twilioConfig;

    public Map<String, IntegrationStatus> checkIntegrations() {
        Map<String, IntegrationStatus> statusMap = new HashMap<>();

        // 1. OpenAI Check
        statusMap.put("OpenAI", checkOpenAi());

        // 2. Cloudinary Check
        statusMap.put("Cloudinary", checkCloudinary());

        // 3. Esewa Check
        statusMap.put("Esewa", checkEsewa());

        // 4. SMS Gateway Check
        statusMap.put("SMS Gateway", checkSms());

        // 5. Twilio (WhatsApp) Check
        statusMap.put("Twilio", checkTwilio());

        // 6. Firebase (Push) Check
        statusMap.put("Firebase", checkFirebase());

        return statusMap;
    }

    private IntegrationStatus checkTwilio() {
        if (twilioConfig.getAccountSid() == null || twilioConfig.getAccountSid().startsWith("AC00000")) {
            return IntegrationStatus.builder().status("UNKNOWN").details("Not Configured (Default SID)").build();
        }
        return IntegrationStatus.builder().status("UP").details("Number: " + twilioConfig.getWhatsappNumber()).build();
    }

    private IntegrationStatus checkFirebase() {
        boolean isInitialized = !com.google.firebase.FirebaseApp.getApps().isEmpty();
        return IntegrationStatus.builder()
                .status(isInitialized ? "UP" : "DOWN")
                .details(isInitialized ? "Initialized" : "Failed to initialize or not configured")
                .build();
    }

    private IntegrationStatus checkOpenAi() {
        if (openAiProperties.getApiKey() == null || openAiProperties.getApiKey().isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("API Key missing").build();
        }
        // Basic config check mostly, deep ping might verify key validity but costs
        // money/quota
        return IntegrationStatus.builder().status("UP").details("Model: " + openAiProperties.getModel()).build();
    }

    private IntegrationStatus checkCloudinary() {
        if (cloudinaryProperties.getCloudName() == null || cloudinaryProperties.getCloudName().isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("Cloud Name missing").build();
        }
        return IntegrationStatus.builder().status("UP").details("Cloud: " + cloudinaryProperties.getCloudName()).build();
    }

    private IntegrationStatus checkEsewa() {
        if (paymentProperties.getEsewa().getMerchantCode() == null || paymentProperties.getEsewa().getMerchantCode().isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("Merchant Code missing").build();
        }
        return IntegrationStatus.builder().status("UP").details("Merchant: " + paymentProperties.getEsewa().getMerchantCode()).build();
    }

    private IntegrationStatus checkSms() {
        if (smsProperties.getApiKey() == null || smsProperties.getApiKey().isEmpty()) {
            return IntegrationStatus.builder().status("UNKNOWN").details("Not Configured (Dev Mode)").build();
        }
        return IntegrationStatus.builder().status("UP").details("Configured").build();
    }

    @Data
    @Builder
    public static class IntegrationStatus {
        private String status; // UP, DOWN, UNKNOWN
        private String details;
    }
}

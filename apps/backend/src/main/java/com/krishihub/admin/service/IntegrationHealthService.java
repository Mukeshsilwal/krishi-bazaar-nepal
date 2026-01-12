package com.krishihub.admin.service;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationHealthService {

    @Value("${app.openai.model:gpt-3.5-turbo}")
    private String openAiModel;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiKey;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${app.esewa.merchant-code:}")
    private String esewaMerchantCode;

    @Value("${app.sms.api-key:}")
    private String smsApiKey;

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

        return statusMap;
    }

    private IntegrationStatus checkOpenAi() {
        if (openAiKey == null || openAiKey.isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("API Key missing").build();
        }
        // Basic config check mostly, deep ping might verify key validity but costs
        // money/quota
        return IntegrationStatus.builder().status("UP").details("Model: " + openAiModel).build();
    }

    private IntegrationStatus checkCloudinary() {
        if (cloudinaryCloudName == null || cloudinaryCloudName.isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("Cloud Name missing").build();
        }
        return IntegrationStatus.builder().status("UP").details("Cloud: " + cloudinaryCloudName).build();
    }

    private IntegrationStatus checkEsewa() {
        if (esewaMerchantCode == null || esewaMerchantCode.isEmpty()) {
            return IntegrationStatus.builder().status("DOWN").details("Merchant Code missing").build();
        }
        return IntegrationStatus.builder().status("UP").details("Merchant: " + esewaMerchantCode).build();
    }

    private IntegrationStatus checkSms() {
        if (smsApiKey == null || smsApiKey.isEmpty()) {
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

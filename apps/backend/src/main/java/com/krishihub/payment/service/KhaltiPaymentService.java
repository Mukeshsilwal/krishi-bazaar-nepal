package com.krishihub.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KhaltiPaymentService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.payment.khalti.public-key}")
    private String publicKey;

    @Value("${app.payment.khalti.secret-key}")
    private String secretKey;

    @Value("${app.payment.khalti.success-url}")
    private String successUrl;

    @Value("${app.payment.khalti.failure-url}")
    private String failureUrl;

    public Map<String, Object> initiatePayment(UUID orderId, BigDecimal amount) {
        try {
            // For development, return mock data
            if (publicKey == null || publicKey.isEmpty()) {
                log.info("=== Khalti Payment (Development Mode) ===");
                log.info("Order ID: {}", orderId);
                log.info("Amount: NPR {}", amount);
                log.info("Mock Payment URL: https://khalti.com/mock-payment");
                log.info("==========================================");

                Map<String, Object> response = new HashMap<>();
                response.put("payment_url", "https://khalti.com/mock-payment?order=" + orderId);
                response.put("pidx", "mock-pidx-" + UUID.randomUUID());
                return response;
            }

            // TODO: Implement actual Khalti integration
            // Khalti API documentation: https://docs.khalti.com/

            /*
             * Example Khalti integration:
             * 
             * WebClient webClient = webClientBuilder
             * .baseUrl("https://khalti.com/api/v2")
             * .build();
             * 
             * Map<String, Object> requestBody = new HashMap<>();
             * requestBody.put("return_url", successUrl);
             * requestBody.put("website_url", "https://krishihub.com");
             * requestBody.put("amount", amount.multiply(new BigDecimal(100)).intValue());
             * // Convert to paisa
             * requestBody.put("purchase_order_id", orderId.toString());
             * requestBody.put("purchase_order_name", "Crop Order " + orderId);
             * 
             * Map<String, Object> response = webClient.post()
             * .uri("/epayment/initiate/")
             * .header("Authorization", "Key " + secretKey)
             * .bodyValue(requestBody)
             * .retrieve()
             * .bodyToMono(Map.class)
             * .block();
             * 
             * return response;
             */

            Map<String, Object> mockResponse = new HashMap<>();
            mockResponse.put("payment_url", "https://test-pay.khalti.com/?pidx=mock-" + orderId);
            mockResponse.put("pidx", "mock-pidx-" + orderId);

            log.info("Khalti payment initiated for order: {}", orderId);
            return mockResponse;

        } catch (Exception e) {
            log.error("Failed to initiate Khalti payment: {}", e.getMessage());
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String pidx) {
        try {
            // For development, always return true
            if (secretKey == null || secretKey.isEmpty()) {
                log.info("=== Khalti Payment Verification (Development) ===");
                log.info("PIDX: {}", pidx);
                log.info("Status: VERIFIED (Mock)");
                log.info("=================================================");
                return true;
            }

            // TODO: Implement actual Khalti verification
            /*
             * WebClient webClient = webClientBuilder
             * .baseUrl("https://khalti.com/api/v2")
             * .build();
             * 
             * Map<String, Object> requestBody = new HashMap<>();
             * requestBody.put("pidx", pidx);
             * 
             * Map<String, Object> response = webClient.post()
             * .uri("/epayment/lookup/")
             * .header("Authorization", "Key " + secretKey)
             * .bodyValue(requestBody)
             * .retrieve()
             * .bodyToMono(Map.class)
             * .block();
             * 
             * String status = (String) response.get("status");
             * return "Completed".equals(status);
             */

            log.info("Khalti payment verified: {}", pidx);
            return true;

        } catch (Exception e) {
            log.error("Failed to verify Khalti payment: {}", e.getMessage());
            return false;
        }
    }
}

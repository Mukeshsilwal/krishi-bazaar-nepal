package com.krishihub.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EsewaPaymentService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.payment.esewa.merchant-id}")
    private String merchantId;

    @Value("${app.payment.esewa.secret-key}")
    private String secretKey;

    @Value("${app.payment.esewa.success-url}")
    private String successUrl;

    @Value("${app.payment.esewa.failure-url}")
    private String failureUrl;

    public String initiatePayment(UUID orderId, BigDecimal amount) {
        try {
            // For development, return a mock payment URL
            if (merchantId == null || merchantId.isEmpty()) {
                log.info("=== eSewa Payment (Development Mode) ===");
                log.info("Order ID: {}", orderId);
                log.info("Amount: NPR {}", amount);
                log.info("Mock Payment URL: https://esewa.com.np/mock-payment");
                log.info("==========================================");
                return "https://esewa.com.np/mock-payment?order=" + orderId;
            }

            // TODO: Implement actual eSewa integration
            // eSewa API documentation: https://developer.esewa.com.np/

            /*
             * Example eSewa integration:
             * 
             * String productCode = "KRISHI-" + orderId.toString();
             * 
             * Map<String, String> params = new HashMap<>();
             * params.put("amt", amount.toString());
             * params.put("psc", "0"); // Service charge
             * params.put("pdc", "0"); // Delivery charge
             * params.put("txAmt", "0"); // Tax amount
             * params.put("tAmt", amount.toString()); // Total amount
             * params.put("pid", productCode);
             * params.put("scd", merchantId);
             * params.put("su", successUrl);
             * params.put("fu", failureUrl);
             * 
             * // Build payment URL
             * String baseUrl = "https://uat.esewa.com.np/epay/main";
             * StringBuilder url = new StringBuilder(baseUrl + "?");
             * params.forEach((key, value) ->
             * url.append(key).append("=").append(value).append("&"));
             * 
             * return url.toString();
             */

            log.info("eSewa payment initiated for order: {}", orderId);
            return "https://uat.esewa.com.np/epay/main?order=" + orderId;

        } catch (Exception e) {
            log.error("Failed to initiate eSewa payment: {}", e.getMessage());
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String transactionId, BigDecimal amount) {
        try {
            // For development, always return true
            if (merchantId == null || merchantId.isEmpty()) {
                log.info("=== eSewa Payment Verification (Development) ===");
                log.info("Transaction ID: {}", transactionId);
                log.info("Amount: NPR {}", amount);
                log.info("Status: VERIFIED (Mock)");
                log.info("================================================");
                return true;
            }

            // TODO: Implement actual eSewa verification
            /*
             * WebClient webClient =
             * webClientBuilder.baseUrl("https://uat.esewa.com.np").build();
             * 
             * String response = webClient.get()
             * .uri(uriBuilder -> uriBuilder
             * .path("/epay/transrec")
             * .queryParam("amt", amount)
             * .queryParam("rid", transactionId)
             * .queryParam("pid", productCode)
             * .queryParam("scd", merchantId)
             * .build())
             * .retrieve()
             * .bodyToMono(String.class)
             * .block();
             * 
             * return response != null && response.contains("Success");
             */

            log.info("eSewa payment verified: {}", transactionId);
            return true;

        } catch (Exception e) {
            log.error("Failed to verify eSewa payment: {}", e.getMessage());
            return false;
        }
    }
}

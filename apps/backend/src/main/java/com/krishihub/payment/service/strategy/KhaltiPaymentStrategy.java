package com.krishihub.payment.service.strategy;

import com.krishihub.payment.config.KhaltiProperties;
import com.krishihub.payment.entity.Transaction;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class KhaltiPaymentStrategy implements PaymentStrategy {

    private final WebClient.Builder webClientBuilder;
    private final KhaltiProperties khaltiProperties;

    @Override
    public Transaction.PaymentMethod getPaymentMethod() {
        return Transaction.PaymentMethod.KHALTI;
    }

    @Override
    public PaymentInitiationResult initiatePayment(UUID orderId, BigDecimal amount) {
        try {
            String initiatUrl = khaltiProperties.getBaseUrl() + "epayment/initiate/";
            
            // Amount in paisa
            long amountPaisa = amount.multiply(BigDecimal.valueOf(100)).longValue();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("return_url", khaltiProperties.getSuccessUrl());
            requestBody.put("website_url", "https://krishibazaar.com"); // Configurable?
            requestBody.put("amount", amountPaisa);
            requestBody.put("purchase_order_id", orderId.toString());
            requestBody.put("purchase_order_name", "Order #" + orderId);
            
            // Customer info (optional but good practice)
            Map<String, String> customerInfo = new HashMap<>();
            customerInfo.put("name", "Krishi User"); // Ideally fetch from UserContext
            customerInfo.put("email", "user@example.com");
            requestBody.put("customer_info", customerInfo);

            log.info("Initiating Khalti payment for Order: {}", orderId);

            KhaltiInitiateResponse response = webClientBuilder.build()
                    .post()
                    .uri(initiatUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Key " + khaltiProperties.getSecretKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(KhaltiInitiateResponse.class)
                    .block();

            if (response == null || response.getPidx() == null) {
                throw new RuntimeException("Empty response from Khalti");
            }

            return PaymentInitiationResult.builder()
                    .transactionId(response.getPidx())
                    .paymentUrl(response.getPayment_url())
                    .paymentData(new HashMap<>()) // Any extra data
                    .build();

        } catch (Exception e) {
            log.error("Failed to initiate Khalti payment: {}", e.getMessage());
            throw new RuntimeException("Failed to initiate payment: " + e.getMessage());
        }
    }

    @Override
    public PaymentVerificationResult verifyPayment(String transactionId, BigDecimal amount) {
        try {
            String lookupUrl = khaltiProperties.getBaseUrl() + "epayment/lookup/";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("pidx", transactionId);

            log.info("Verifying Khalti payment: {}", transactionId);

            KhaltiLookupResponse response = webClientBuilder.build()
                    .post()
                    .uri(lookupUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Key " + khaltiProperties.getSecretKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(KhaltiLookupResponse.class)
                    .block();

            if (response == null) {
                log.error("Empty response during verification");
                return PaymentVerificationResult.builder()
                        .success(false)
                        .failureReason("Empty response from Khalti")
                        .build();
            }

            log.info("Khalti Verification Response: Status={}, PIDX={}", response.getStatus(), response.getPidx());

            boolean success = "Completed".equalsIgnoreCase(response.getStatus());

            return PaymentVerificationResult.builder()
                    .success(success)
                    .transactionId(response.getTransaction_id())
                    .failureReason(success ? null : "Status: " + response.getStatus())
                    .rawResponse(response.toString())
                    .build();

        } catch (Exception e) {
            log.error("Failed to verify Khalti payment: {}", e.getMessage());
            return PaymentVerificationResult.builder()
                    .success(false)
                    .failureReason(e.getMessage())
                    .build();
        }
    }

    @Data
    private static class KhaltiInitiateResponse {
        private String pidx;
        private String payment_url;
        private String expires_at;
        private int expires_in;
    }

    @Data
    private static class KhaltiLookupResponse {
        private String pidx;
        private String total_amount;
        private String status;
        private String transaction_id;
        private String fee;
        private boolean refunded;
    }
}

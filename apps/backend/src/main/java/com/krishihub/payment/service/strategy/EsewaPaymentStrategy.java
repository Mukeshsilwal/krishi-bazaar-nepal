package com.krishihub.payment.service.strategy;

import com.krishihub.common.exception.SystemException;
import com.krishihub.config.properties.PaymentProperties;
import com.krishihub.payment.entity.Transaction;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * ===========================
 * eSewa Payment Strategy
 * ===========================
 * <p>
 * Responsibilities:
 * - Generate signed redirect form
 * - Redirect user to eSewa
 * - Verify transaction after callback
 * <p>
 * Design Rules:
 * - Amount precision MUST be consistent
 * - Signature order MUST match signed_field_names
 * - Never expose gateway errors to frontend
 * - SPA compatible redirect handling
 *
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EsewaPaymentStrategy implements PaymentStrategy {

    private final PaymentProperties paymentProperties;
    private final RestTemplate restTemplate;

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Override
    public Transaction.PaymentMethod getPaymentMethod() {
        return Transaction.PaymentMethod.ESEWA;
    }

    /**
     * --------------------------------
     * PAYMENT INITIATION
     * --------------------------------
     */
    @Override
    public PaymentInitiationResult initiatePayment(UUID orderId, BigDecimal amount) {

        PaymentProperties.Esewa esewa = paymentProperties.getEsewa();

        try {
            BigDecimal normalizedAmount = normalizeAmount(amount);
            String transactionUuid = String.valueOf(java.util.concurrent.ThreadLocalRandom.current().nextInt(100000, 1000000));
            String productCode = esewa.getMerchantCode();

            String successUrl = esewa.getSuccessUrl() + "?txnId=" + transactionUuid;
            String failureUrl = esewa.getFailureUrl() + "?txnId=" + transactionUuid;

            String secretKey = esewa.getSecretKey().trim();

            String signature = generateSignature(
                    productCode,
                    normalizedAmount,
                    transactionUuid,
                    secretKey
            );

            log.info("eSewa Payment Initiation:");
            log.info("  Transaction UUID: {}", transactionUuid);
            log.info("  Amount: {}", formatAmount(normalizedAmount));
            log.info("  Product Code: {}", productCode);
            log.info("  Signature: {}", signature);
            log.info("  Success URL: {}", successUrl);
            log.info("  Failure URL: {}", failureUrl);

            String htmlForm = buildEsewaRedirectForm(
                    esewa,
                    normalizedAmount,
                    transactionUuid,
                    signature,
                    successUrl,
                    failureUrl
            );

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("htmlForm", htmlForm);

            return PaymentInitiationResult.builder()
                    .transactionId(transactionUuid)
                    .paymentUrl("esewa-redirect")
                    .paymentData(paymentData)
                    .build();

        } catch (Exception ex) {
            log.error("eSewa payment initiation failed | orderId={}", orderId, ex);
            throw new SystemException("Unable to initiate payment. Please try again.");
        }
    }

    /**
     * --------------------------------
     * PAYMENT VERIFICATION
     * --------------------------------
     */
    @Override
    public PaymentVerificationResult verifyPayment(String transactionUuid, BigDecimal amount) {

        PaymentProperties.Esewa esewa = paymentProperties.getEsewa();

        try {
            BigDecimal normalizedAmount = normalizeAmount(amount);

            String verifyUrl = UriComponentsBuilder
                    .fromHttpUrl(esewa.getVerifyUrl())
                    .queryParam("product_code", esewa.getMerchantCode())
                    .queryParam("total_amount", formatAmount(normalizedAmount))
                    .queryParam("transaction_uuid", transactionUuid)
                    .toUriString();

            log.info("eSewa verify URL => {}", verifyUrl);

            ResponseEntity<String> response = restTemplate.getForEntity(verifyUrl, String.class);

            log.info("eSewa verification response status: {}", response.getStatusCode());
            log.info("eSewa verification response body: {}", response.getBody());

            VerificationResult parsed = parseVerificationResponse(response.getBody());

            if (!parsed.isSuccess()) {
                log.warn("eSewa verification failed => {}", parsed.getRawResponse());

                return PaymentVerificationResult.builder()
                        .success(false)
                        .failureReason(parsed.getFailureReason() != null ?
                                parsed.getFailureReason() : "Payment verification failed")
                        .rawResponse(parsed.getRawResponse())
                        .build();
            }

            log.info("eSewa payment verified successfully => Transaction: {}, RefID: {}",
                    transactionUuid, parsed.getRefId());

            return PaymentVerificationResult.builder()
                    .success(true)
                    .transactionId(parsed.getRefId())
                    .rawResponse(parsed.getRawResponse())
                    .build();

        } catch (Exception ex) {
            log.error("eSewa verification exception for transaction: {}", transactionUuid, ex);

            return PaymentVerificationResult.builder()
                    .success(false)
                    .failureReason("Unable to verify payment: " + ex.getMessage())
                    .build();
        }
    }

    /**
     * --------------------------------
     * FORM BUILDER
     * --------------------------------
     * CRITICAL: Signature must match eSewa's expected format
     */
    private String buildEsewaRedirectForm(
            PaymentProperties.Esewa esewa,
            BigDecimal amount,
            String transactionUuid,
            String signature,
            String successUrl,
            String failureUrl
    ) {

        String formattedAmount = formatAmount(amount);

        return """
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Redirecting to eSewa...</title>
                  </head>
                  <body onload="document.forms[0].submit()">
                    <form action="%s" method="POST">
                
                      <input type="hidden" name="amount" value="%s"/>
                      <input type="hidden" name="tax_amount" value="0"/>
                      <input type="hidden" name="total_amount" value="%s"/>
                      <input type="hidden" name="transaction_uuid" value="%s"/>
                      <input type="hidden" name="product_code" value="%s"/>
                      <input type="hidden" name="product_service_charge" value="0"/>
                      <input type="hidden" name="product_delivery_charge" value="0"/>
                      <input type="hidden" name="success_url" value="%s"/>
                      <input type="hidden" name="failure_url" value="%s"/>
                      <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code"/>
                      <input type="hidden" name="signature" value="%s"/>
                
                      <noscript>
                        <p>Please click the button below to proceed with payment.</p>
                        <input type="submit" value="Continue to eSewa"/>
                      </noscript>
                    </form>
                    <div style="text-align: center; margin-top: 50px;">
                      <p>Redirecting to eSewa payment gateway...</p>
                    </div>
                  </body>
                </html>
                """.formatted(
                esewa.getBaseUrl(),
                formattedAmount,
                formattedAmount,
                transactionUuid,
                esewa.getMerchantCode(),
                successUrl,
                failureUrl,
                signature
        );
    }

    /**
     * --------------------------------
     * SIGNATURE GENERATOR
     * --------------------------------
     * CRITICAL: eSewa Official Order (from docs)
     * Order: total_amount, transaction_uuid, product_code
     */
    private String generateSignature(
            String productCode,
            BigDecimal amount,
            String transactionUuid,
            String secretKey
    ) throws Exception {

        String payload = String.format(
                "total_amount=%s,transaction_uuid=%s,product_code=%s",
                formatAmount(amount),
                transactionUuid,
                productCode
        );

        log.info("eSewa signature payload: [{}]", payload);
        log.info("eSewa secret key length: {}", secretKey.length());

        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec key = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8),
                HMAC_SHA256
        );

        mac.init(key);
        byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

        String signature = Base64.getEncoder().encodeToString(rawHmac);

        log.info("eSewa generated signature: {}", signature);

        return signature;
    }

    /**
     * --------------------------------
     * RESPONSE PARSER
     * --------------------------------
     */
    private VerificationResult parseVerificationResponse(String response) {

        VerificationResult result = new VerificationResult();
        result.setRawResponse(response);

        if (response == null || response.isBlank()) {
            result.setSuccess(false);
            result.setFailureReason("Empty gateway response");
            return result;
        }

        String normalized = response.toLowerCase();

        boolean success = normalized.contains("<status>success</status>") ||
                normalized.contains("\"status\":\"success\"") ||
                normalized.contains("\"status\": \"success\"");

        result.setSuccess(success);

        if (success) {
            result.setRefId(extractRefId(response));
        } else {
            // Try to extract failure reason
            result.setFailureReason(extractFailureReason(response));
        }

        return result;
    }

    private String extractRefId(String response) {
        try {
            // Try JSON format first
            int refIdIndex = response.indexOf("\"ref_id\"");
            if (refIdIndex == -1) {
                refIdIndex = response.indexOf("\"reference_id\"");
            }

            if (refIdIndex != -1) {
                int start = response.indexOf("\"", refIdIndex + 10);
                int end = response.indexOf("\"", start + 1);
                if (start != -1 && end != -1) {
                    return response.substring(start + 1, end);
                }
            }

            // Try XML format
            int xmlStart = response.indexOf("<ref_id>");
            if (xmlStart != -1) {
                int xmlEnd = response.indexOf("</ref_id>");
                if (xmlEnd != -1) {
                    return response.substring(xmlStart + 8, xmlEnd);
                }
            }

            return "N/A";

        } catch (Exception ex) {
            log.warn("Unable to extract ref_id from eSewa response", ex);
            return "N/A";
        }
    }

    private String extractFailureReason(String response) {
        try {
            String normalized = response.toLowerCase();

            // Look for common error patterns
            if (normalized.contains("invalid signature")) {
                return "Invalid signature";
            }
            if (normalized.contains("transaction not found")) {
                return "Transaction not found";
            }
            if (normalized.contains("amount mismatch")) {
                return "Amount mismatch";
            }

            return "Payment verification failed";

        } catch (Exception ex) {
            return "Unknown error";
        }
    }

    /**
     * AMOUNT UTILS
     */
    private BigDecimal normalizeAmount(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String formatAmount(BigDecimal value) {
        return String.format(java.util.Locale.US, "%.2f", value);
    }

    /**
     * --------------------------------
     * INTERNAL DTO
     * --------------------------------
     */
    @Data
    private static class VerificationResult {
        private boolean success;
        private String refId;
        private String failureReason;
        private String rawResponse;
    }
}
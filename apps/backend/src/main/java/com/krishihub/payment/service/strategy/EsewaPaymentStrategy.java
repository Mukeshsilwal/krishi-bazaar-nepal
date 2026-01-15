package com.krishihub.payment.service.strategy;

import com.krishihub.config.properties.PaymentProperties;
import com.krishihub.payment.entity.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Implements eSewa payment gateway integration for Nepal.
 *
 * Design Notes:
 * - Uses HTML form auto-submit pattern to redirect users to eSewa payment page.
 * - Signature is generated using HMAC-SHA256 to prevent tampering.
 * - Verification is done via eSewa's REST API after payment completion.
 *
 * Business Rules:
 * - Tax, service charge, and delivery charge are currently set to 0.
 * - Total amount must match exactly during verification.
 * - Transaction UUID (order ID) is used as the primary identifier.
 *
 * Security:
 * - NEVER log the secret key or raw signature in production.
 * - All callback URLs must be HTTPS in production.
 * - Signature verification prevents payment amount manipulation.
 *
 * Important:
 * - eSewa API responses are not always JSON; parsing is defensive.
 * - Payment verification may fail due to network issues; implement retry logic at caller level.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EsewaPaymentStrategy implements PaymentStrategy {

    private final PaymentProperties paymentProperties;
    private final RestTemplate restTemplate;

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Override
    public Transaction.PaymentMethod getPaymentMethod() {
        return Transaction.PaymentMethod.ESEWA;
    }

    @Override
    public PaymentInitiationResult initiatePayment(UUID orderId, BigDecimal amount) {
        try {
            PaymentProperties.Esewa esewa = paymentProperties.getEsewa();

            // Business Rule: Tax, service charge, and delivery charge are 0 for now.
            BigDecimal taxAmt = BigDecimal.ZERO;
            BigDecimal psc = BigDecimal.ZERO;
            BigDecimal pdc = BigDecimal.ZERO;
            BigDecimal tAmt = amount.add(taxAmt).add(psc).add(pdc);

            // Generate unique transaction ID for eSewa
            // Format: KBHexTimestampHexRandom (Purely Alphanumeric, Namespaced, No Hyphens)
            // Example: KB18d0e729a5f56
            String uniqueSuffix = Long.toHexString(System.currentTimeMillis());
            String randomSuffix = Integer.toHexString(new java.util.Random().nextInt(256));
            String pid = "KB" + uniqueSuffix + randomSuffix;
            String scd = esewa.getMerchantCode();
            
            // Callback URL must allow frontend to identify the ORDER, so we pass raw orderId as txnId param
            // Frontend will call verify -> Controller -> Service -> Service looks up by Order ID (pid) 
            // Callback URL: Append Order ID as Path Variable to avoid query param issues?
            // eSewa will redirect to `success_url` and append its own params (?oid=...&amt=...)
            // If we use http://localhost:8080/payment/success/{orderId} eSewa makes it:
            // http://localhost:8080/payment/success/{orderId}?oid=KB...&amt=...
            // This is clean and valid.
            String su = esewa.getSuccessUrl() + "/" + orderId;
            String fu = esewa.getFailureUrl() + "/" + orderId;

            // SECURITY: Signature prevents tampering with payment amount or transaction ID.
            // DEBUGGING: Log critical details to diagnose signature mismatch
            String signaturePayload = String.format("product_code=%s,total_amount=%s,transaction_uuid=%s",
                    scd, trimAmount(tAmt), pid);
            
            // Mask secret key for logs but show length and boundaries
            String sk = esewa.getSecretKey();
            log.info("DEBUG eSewa - SecretKey Len: {}, Start: '{}', End: '{}'", 
                    sk != null ? sk.length() : "null", 
                    sk != null && sk.length() > 2 ? sk.substring(0, 2) : "?",
                    sk != null && sk.length() > 2 ? sk.substring(sk.length() - 2) : "?");
            log.info("DEBUG eSewa - Signature Payload: '{}'", signaturePayload);
            log.info("DEBUG eSewa - PID Len: {}", pid.length());

            String signature = generateEsewaV2Signature(tAmt, pid, scd, esewa.getSecretKey());

            log.info("eSewa Payment Initiation - Transaction ID: {}, Amount: {}, Signature generated: {}", pid, tAmt, signature);

            String htmlForm = """
                    <html>
                      <body onload="document.forms[0].submit()">
                        <form action="%s" method="POST">
                          <input type="hidden" name="amount" value="%s"/>
                          <input type="hidden" name="tax_amount" value="%s"/>
                          <input type="hidden" name="total_amount" value="%s"/>
                          <input type="hidden" name="transaction_uuid" value="%s"/>
                          <input type="hidden" name="product_code" value="%s"/>
                          <input type="hidden" name="product_service_charge" value="%s"/>
                          <input type="hidden" name="product_delivery_charge" value="%s"/>
                          <input type="hidden" name="success_url" value="%s"/>
                          <input type="hidden" name="failure_url" value="%s"/>
                          <input type="hidden" name="signed_field_names" value="product_code,total_amount,transaction_uuid"/>
                          <input type="hidden" name="signature" value="%s"/>
                        </form>
                      </body>
                    </html>
                    """
                    .formatted(
                            esewa.getBaseUrl(),
                            trimAmount(amount),
                            trimAmount(taxAmt),
                            trimAmount(tAmt),
                            htmlEscape(pid),
                            htmlEscape(scd),
                            trimAmount(psc),
                            trimAmount(pdc),
                            htmlEscape(su),
                            htmlEscape(fu),
                            htmlEscape(signature));

            // DEBUG: Log the standard form to check for malformed attributes
            log.info("DEBUG eSewa - Form: {}", htmlForm.replace("\n", "").replace("  ", " "));

            Map<String, Object> responseData = new HashMap<>(); // Using HashMap for compatibility
            responseData.put("htmlForm", htmlForm);
            responseData.put("transactionId", pid);
            responseData.put("amount", amount);
            responseData.put("totalAmount", tAmt);

            return PaymentInitiationResult.builder()
                    .transactionId(pid)
                    .paymentUrl("esewa-redirect")
                    .paymentData(responseData)
                    .build();

        } catch (Exception e) {
            log.error("Error initiating eSewa payment", e);
            throw new com.krishihub.common.exception.SystemException("Payment Initiation Failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentVerificationResult verifyPayment(String transactionId, BigDecimal amount) {
        try {
            PaymentProperties.Esewa esewa = paymentProperties.getEsewa();
            String url = UriComponentsBuilder
                    .fromHttpUrl(esewa.getVerifyUrl())
                    .queryParam("product_code", esewa.getMerchantCode())
                    .queryParam("transaction_uuid", transactionId)
                    .queryParam("total_amount", trimAmount(amount))
                    .toUriString();

            log.info("Verifying eSewa payment: {}", url);

            ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);

            VerificationResult result = parseVerificationResponse(responseEntity.getBody());

            if (!result.isSuccess()) {
                log.error("Payment verification failed: {}", result.getFailureReason());
                return PaymentVerificationResult.builder()
                        .success(false)
                        .failureReason(result.getFailureReason())
                        .rawResponse(result.getRawResponse())
                        .build();
            }

            log.info("Payment verified successfully. Ref ID: {}", result.getRefId());
            return PaymentVerificationResult.builder()
                    .success(true)
                    .transactionId(result.getRefId())
                    .rawResponse(result.getRawResponse())
                    .build();

        } catch (Exception e) {
            log.error("eSewa verification error", e);
            return PaymentVerificationResult.builder()
                    .success(false)
                    .failureReason(e.getMessage())
                    .build();
        }
    }

    /**
     * Generates HMAC-SHA256 signature for eSewa payment request.
     */
    private String generateEsewaV2Signature(BigDecimal totalAmount, String transactionUuid, String productCode,
            String secretKey) throws Exception {
        String amtStr = trimAmount(totalAmount);
        // Alphabetical Order: product_code, total_amount, transaction_uuid
        String message = String.format("product_code=%s,total_amount=%s,transaction_uuid=%s",
                productCode, amtStr, transactionUuid);

        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(rawHmac);
    }

    private String trimAmount(BigDecimal value) {
        // Strict 2-decimal formatting (e.g. 0.00) for eSewa compliance
        return String.format(java.util.Locale.US, "%.2f", value);
    }

    private String htmlEscape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String buildCallbackUrl(String baseUrl, String transactionId) {
        return baseUrl.contains("?")
                ? baseUrl + "&txnId=" + transactionId
                : baseUrl + "?txnId=" + transactionId;
    }

    /**
     * Parses eSewa verification response (defensive parsing).
     *
     * Important:
     * - eSewa API responses are not always consistent (JSON vs XML vs plain text).
     * - This method uses defensive string matching to detect success.
     * - Multiple success indicators are checked to handle API variations.
     *
     * Workaround:
     * - We cannot rely on structured JSON parsing due to eSewa API inconsistency.
     * - String matching is intentionally case-insensitive for robustness.
     */
    private VerificationResult parseVerificationResponse(String response) {
        VerificationResult result = new VerificationResult();
        result.setRawResponse(response);

        if (response == null || response.isEmpty()) {
            result.setSuccess(false);
            result.setFailureReason("Empty response from gateway");
            return result;
        }

        // Check multiple success indicators due to eSewa API inconsistency
        boolean success = response.toLowerCase().contains("success") ||
                response.toLowerCase().contains("complete") ||
                response.contains("<status>Success</status>") ||
                response.contains("\"status\":\"Success\"");

        result.setSuccess(success);
        if (success) {
            result.setRefId(extractRefId(response));
        } else {
            result.setFailureReason(extractFailureReason(response));
        }
        return result;
    }

    private String extractRefId(String response) {
        try {
            int idx = response.indexOf("ref_id");
            if (idx == -1) return "N/A";
            
            // Find colon after ref_id
            int colIdx = response.indexOf(":", idx);
            if (colIdx == -1) return "N/A";

            // Find opening quote of value
            int valStartQuote = response.indexOf("\"", colIdx);
            if (valStartQuote == -1) return "N/A";

            // Find closing quote
            int valEndQuote = response.indexOf("\"", valStartQuote + 1);
            if (valEndQuote == -1) return "N/A";

            return response.substring(valStartQuote + 1, valEndQuote).trim();
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String extractFailureReason(String response) {
        response = response.toLowerCase();
        if (response.contains("insufficient")) return "Insufficient balance";
        if (response.contains("invalid")) return "Invalid transaction or credentials";
        if (response.contains("expired")) return "Transaction expired";
        if (response.contains("cancelled")) return "Cancelled by user";
        return "Payment verification failed";
    }

    @lombok.Data
    private static class VerificationResult {
        private boolean success;
        private String refId;
        private String failureReason;
        private String rawResponse;
    }
}

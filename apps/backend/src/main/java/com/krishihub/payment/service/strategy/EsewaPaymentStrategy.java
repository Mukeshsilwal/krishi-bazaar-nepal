package com.krishihub.payment.service.strategy;

import com.krishihub.payment.config.EsewaProperties;
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

    private final EsewaProperties esewaProperties;
    private final RestTemplate restTemplate;

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Override
    public Transaction.PaymentMethod getPaymentMethod() {
        return Transaction.PaymentMethod.ESEWA;
    }

    @Override
    public PaymentInitiationResult initiatePayment(UUID orderId, BigDecimal amount) {
        try {
            // Business Rule: Tax, service charge, and delivery charge are 0 for now.
            // These can be configured in future based on business requirements.
            double amt = amount.doubleValue();
            double taxAmt = 0.0;
            double psc = 0.0;
            double pdc = 0.0;
            double tAmt = amt + taxAmt + psc + pdc;

            String pid = orderId.toString();
            String scd = esewaProperties.getMerchantCode();
            String su = buildCallbackUrl(esewaProperties.getSuccessUrl(), pid);
            String fu = buildCallbackUrl(esewaProperties.getFailureUrl(), pid);

            // SECURITY: Signature prevents tampering with payment amount or transaction ID.
            // eSewa verifies this signature before processing payment.
            String signature = generateEsewaV2Signature(tAmt, pid, scd, esewaProperties.getSecretKey());

            log.info("eSewa Payment Initiation - Transaction ID: {}, Amount: {}, Signature generated", pid, tAmt);

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
                          <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code"/>
                          <input type="hidden" name="signature" value="%s"/>
                        </form>
                      </body>
                    </html>
                    """
                    .formatted(
                            esewaProperties.getBaseUrl(),
                            trimAmount(amt),
                            trimAmount(taxAmt),
                            trimAmount(tAmt),
                            htmlEscape(pid),
                            htmlEscape(scd),
                            trimAmount(psc),
                            trimAmount(pdc),
                            htmlEscape(su),
                            htmlEscape(fu),
                            htmlEscape(signature));

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("htmlForm", htmlForm);
            responseData.put("transactionId", pid);
            responseData.put("amount", amt);
            responseData.put("totalAmount", tAmt);

            return PaymentInitiationResult.builder()
                    .transactionId(pid) // For eSewa, Order ID is used as Transaction ID initially
                    .paymentUrl("esewa-redirect") // Placeholder
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
            String url = UriComponentsBuilder
                    .fromHttpUrl(esewaProperties.getVerifyUrl())
                    .queryParam("product_code", esewaProperties.getMerchantCode())
                    .queryParam("transaction_uuid", transactionId)
                    .queryParam("total_amount", trimAmount(amount.doubleValue()))
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
     *
     * Security:
     * - Signature format: HMAC-SHA256("total_amount=X,transaction_uuid=Y,product_code=Z", secretKey)
     * - This prevents attackers from modifying payment amount or transaction ID.
     * - eSewa validates this signature before processing payment.
     *
     * Important:
     * - Amount must be trimmed (no trailing zeros) to match eSewa's format.
     * - Field order in message MUST match: total_amount, transaction_uuid, product_code.
     * - Changing field order will cause signature mismatch and payment failure.
     */
    private String generateEsewaV2Signature(double totalAmount, String transactionUuid, String productCode,
            String secretKey) throws Exception {
        String amtStr = trimAmount(totalAmount);
        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                amtStr, transactionUuid, productCode);

        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(rawHmac);
    }

    private String trimAmount(double value) {
        BigDecimal bd = BigDecimal.valueOf(value).stripTrailingZeros();
        return bd.toPlainString();
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

package com.krishihub.payment.service.strategy;

import java.math.BigDecimal;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class EsewaStrategyTest {

    public static void main(String[] args) throws Exception {
        // Test Data
        BigDecimal amount = new BigDecimal("49.99");
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = amount.add(tax);
        String pid = "KB19bc17fb91c25";
        String scd = "EPAYTEST";
        String secretKey = "8gBm/:&EnhH.1/q";

        // 1. Verify Formatting
        String formattedTotal = String.format(java.util.Locale.US, "%.2f", total);
        String formattedTax = String.format(java.util.Locale.US, "%.2f", tax);
        
        System.out.println("Formatted Total (Expect 49.99): " + formattedTotal);
        System.out.println("Formatted Tax (Expect 0.00): " + formattedTax);

        if (!"49.99".equals(formattedTotal)) throw new RuntimeException("Total Formatting Failed");
        if (!"0.00".equals(formattedTax)) throw new RuntimeException("Tax Formatting Failed");

        // 2. Verify Signature
        String message = "total_amount=" + formattedTotal + 
                         ",transaction_uuid=" + pid + 
                         ",product_code=" + scd;

        System.out.println("Signature Payload: " + message);

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getEncoder().encodeToString(rawHmac);

        System.out.println("Generated Signature: " + signature);
        
        // Known good signature from external tool (if available) or just manual check
        // For now, checks that it runs and outputs expected format
    }
}

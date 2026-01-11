package com.krishihub.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.payment.esewa")
@Data
public class EsewaProperties {

    /**
     * eSewa merchant/product code
     */
    private String merchantCode;

    /**
     * Secret key for HMAC signature generation
     */
    private String secretKey;

    /**
     * eSewa payment gateway base URL
     * UAT: https://rc-epay.esewa.com.np/api/epay/main/v2/form
     * Production: https://epay.esewa.com.np/api/epay/main/v2/form
     */
    private String baseUrl;

    /**
     * eSewa payment verification endpoint
     * UAT: https://uat.esewa.com.np/api/epay/transaction/status/
     * Production: https://epay.esewa.com.np/api/epay/transaction/status/
     */
    private String verifyUrl;

    /**
     * Callback URL for successful payments
     */
    private String successUrl;

    /**
     * Callback URL for failed payments
     */
    private String failureUrl;
}

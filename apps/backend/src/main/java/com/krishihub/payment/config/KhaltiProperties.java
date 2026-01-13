package com.krishihub.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.payment.khalti")
@Data
public class KhaltiProperties {
    private String publicKey;
    private String secretKey;
    private String baseUrl = "https://a.khalti.com/api/v2/";
    private String successUrl;
    private String failureUrl;
}

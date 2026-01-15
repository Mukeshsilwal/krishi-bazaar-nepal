package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/**
 * SMS configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for SMS configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.sms")
public class SmsProperties {

    private String apiUrl;

    private String apiKey;

    @NotBlank(message = "Sender ID must not be blank")
    private String senderId;
}

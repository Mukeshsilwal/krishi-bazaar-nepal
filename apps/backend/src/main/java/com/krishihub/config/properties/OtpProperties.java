package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;

/**
 * OTP configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.otp")
public class OtpProperties {

    @Min(value = 60, message = "OTP expiration must be at least 60 seconds")
    private long expiration;

    @Min(value = 4, message = "OTP length must be at least 4")
    private int length;
}

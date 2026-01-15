package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/**
 * Cloudinary configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for Cloudinary configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.cloudinary")
public class CloudinaryProperties {

    @NotBlank(message = "Cloud name must not be blank")
    private String cloudName;

    @NotBlank(message = "API key must not be blank")
    private String apiKey;

    @NotBlank(message = "API secret must not be blank")
    private String apiSecret;
}

package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * JWT configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for JWT configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    @NotBlank(message = "JWT secret must not be blank")
    private String secret;

    @Min(value = 1000, message = "JWT expiration must be at least 1 second")
    private long expiration;

    @Min(value = 1000, message = "JWT refresh expiration must be at least 1 second")
    private long refreshExpiration;
}

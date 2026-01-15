package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * General application properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app")
public class ApplicationProperties {

    @Valid
    @NotNull
    private Admin admin = new Admin();

    @Getter
    @Setter
    public static class Admin {
        @NotBlank(message = "Admin secret key must not be blank")
        private String secretKey;
    }
}

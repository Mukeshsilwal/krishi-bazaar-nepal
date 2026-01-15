package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/**
 * OpenAI configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for OpenAI configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.openai")
public class OpenAiProperties {

    @NotBlank(message = "OpenAI API key must not be blank")
    private String apiKey;

    @NotBlank(message = "OpenAI API URL must not be blank")
    private String apiUrl;

    @NotBlank(message = "OpenAI model must not be blank")
    private String model;
}

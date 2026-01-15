package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

/**
 * Email configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for Email configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {

    @Valid
    @NotNull
    private SendGrid sendgrid = new SendGrid();

    @NotBlank(message = "From email must not be blank")
    @Email(message = "From email must be a valid email address")
    private String fromEmail;

    @Email(message = "Support email must be a valid email address")
    private String support = "support@krishibazaar.com.np";

    @Getter
    @Setter
    public static class SendGrid {
        @NotBlank(message = "SendGrid API key must not be blank")
        private String apiKey;
    }
}

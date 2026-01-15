package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payment configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for Payment configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    @Valid
    @NotNull
    private Esewa esewa = new Esewa();

    @Valid
    @NotNull
    private Khalti khalti = new Khalti();

    @Getter
    @Setter
    public static class Esewa {
        @NotBlank(message = "Esewa merchant code must not be blank")
        private String merchantCode;

        @NotBlank(message = "Esewa secret key must not be blank")
        private String secretKey;

        @NotBlank(message = "Esewa base URL must not be blank")
        private String baseUrl;

        @NotBlank(message = "Esewa verify URL must not be blank")
        private String verifyUrl;

        @NotBlank(message = "Esewa success URL must not be blank")
        private String successUrl;

        @NotBlank(message = "Esewa failure URL must not be blank")
        private String failureUrl;
    }

    @Getter
    @Setter
    public static class Khalti {
        private String publicKey;
        private String secretKey;
        private String successUrl;
        private String failureUrl;
    }
}

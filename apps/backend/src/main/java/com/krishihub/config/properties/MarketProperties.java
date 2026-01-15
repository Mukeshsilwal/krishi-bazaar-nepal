package com.krishihub.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Market configuration properties.
 * Centralized and strongly typed.
 * DO NOT use @Value for Market configuration.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.market")
public class MarketProperties {

    @Valid
    @NotNull
    private Scraper scraper = new Scraper();

    @Getter
    @Setter
    public static class Scraper {
        
        @Valid
        @NotNull
        private Selenium selenium = new Selenium();
        
        @Valid
        @NotNull
        private Kalimati kalimati = new Kalimati();
    }

    @Getter
    @Setter
    public static class Selenium {
        private boolean enabled;
    }

    @Getter
    @Setter
    public static class Kalimati {
        private boolean enabled;
    }
}

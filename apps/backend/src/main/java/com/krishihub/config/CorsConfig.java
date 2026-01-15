package com.krishihub.config;

// import org.springframework.beans.factory.annotation.Value; removed
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private final com.krishihub.config.properties.CorsProperties corsProperties;

    public CorsConfig(com.krishihub.config.properties.CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse allowed origins
        List<String> origins = new java.util.ArrayList<>(corsProperties.getAllowedOrigins());

        if (!origins.contains("http://localhost:8080")) {
            origins.add("http://localhost:8080");
        }
        origins.add("http://localhost:8081"); // Expo Web

        // Allow all Vercel previews
        origins.add("https://*.vercel.app");

        configuration.setAllowedOriginPatterns(origins); // Use patterns instead of origins for better compatibility

        // Parse allowed methods
        List<String> methods = new java.util.ArrayList<>(corsProperties.getAllowedMethods());
        if (!methods.contains("PATCH")) {
            methods.add("PATCH");
        }
        configuration.setAllowedMethods(methods);

        // Set allowed headers
        List<String> headers = corsProperties.getAllowedHeaders();
        if (headers.contains("*")) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(headers);
        }

        // Expose headers for frontend access
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        configuration.setAllowCredentials(corsProperties.isAllowCredentials());
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

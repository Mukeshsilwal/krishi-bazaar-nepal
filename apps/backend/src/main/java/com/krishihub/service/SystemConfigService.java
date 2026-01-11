package com.krishihub.service;

import com.krishihub.entity.SystemConfig;
import com.krishihub.repository.SystemConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    @PostConstruct
    public void initConfigs() {
        log.info("Checking system configuration seeds...");
        seedConfig("auth.rate_limit.requests", "100", "Max requests per minute per IP", SystemConfig.ConfigType.NUMBER, SystemConfig.ConfigCategory.AUTH);
        seedConfig("auth.rate_limit.window_ms", "60000", "Rate limit window in milliseconds", SystemConfig.ConfigType.NUMBER, SystemConfig.ConfigCategory.AUTH);
        seedConfig("auth.otp.validity_sec", "300", "OTP validity period in seconds", SystemConfig.ConfigType.NUMBER, SystemConfig.ConfigCategory.AUTH);
        seedConfig("auth.login.max_attempts", "5", "Max login attempts before lockout", SystemConfig.ConfigType.NUMBER, SystemConfig.ConfigCategory.AUTH);
        
        seedConfig("market.scraper.url", "https://ramropatro.com/vegetable", "Target URL for vegetable price scraping", SystemConfig.ConfigType.STRING, SystemConfig.ConfigCategory.MARKET);
        seedConfig("market.disclaimer.en", "This recommendation is advisory only. Consult local agriculture officers before application.", "Disease disclaimer text (English)", SystemConfig.ConfigType.STRING, SystemConfig.ConfigCategory.UI);
        
        seedConfig("system.notification.queue", "notification.queue", "RabbitMQ queue for notifications", SystemConfig.ConfigType.STRING, SystemConfig.ConfigCategory.SYSTEM);
    }

    private void seedConfig(String key, String value, String description, SystemConfig.ConfigType type, SystemConfig.ConfigCategory category) {
        if (!systemConfigRepository.existsById(key)) {
            log.info("Seeding system config: {}", key);
            systemConfigRepository.save(SystemConfig.builder()
                    .key(key)
                    .value(value)
                    .description(description)
                    .type(type)
                    .category(category)
                    .editable(true)
                    .build());
        }
    }

    @Cacheable(value = "system_config", key = "#key")
    public String getString(String key) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getValue)
                .orElseThrow(() -> new RuntimeException("Config key not found: " + key));
    }

    public String getString(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getValue)
                .orElse(defaultValue);
    }

    @Cacheable(value = "system_config", key = "#key")
    public int getInt(String key) {
        return systemConfigRepository.findById(key)
                .map(c -> Integer.parseInt(c.getValue()))
                .orElseThrow(() -> new RuntimeException("Config key not found: " + key));
    }

    public int getInt(String key, int defaultValue) {
        return systemConfigRepository.findById(key)
                .map(c -> Integer.parseInt(c.getValue()))
                .orElse(defaultValue);
    }

    @Cacheable(value = "system_config", key = "#key")
    public long getLong(String key) {
        return systemConfigRepository.findById(key)
                .map(c -> Long.parseLong(c.getValue()))
                .orElseThrow(() -> new RuntimeException("Config key not found: " + key));
    }

    public long getLong(String key, long defaultValue) {
        return systemConfigRepository.findById(key)
                .map(c -> Long.parseLong(c.getValue()))
                .orElse(defaultValue);
    }

    @Cacheable(value = "system_config", key = "#key")
    public boolean getBoolean(String key) {
        return systemConfigRepository.findById(key)
                .map(c -> Boolean.parseBoolean(c.getValue()))
                .orElse(false);
    }

    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = "system_config", key = "#key")
    public SystemConfig updateConfig(String key, String value) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Config key not found: " + key));
        
        if (!config.isEditable()) {
            throw new RuntimeException("Configuration is not editable: " + key);
        }

        // Basic Type Validation
        validateValue(value, config.getType());

        config.setValue(value);
        return systemConfigRepository.save(config);
    }

    private void validateValue(String value, SystemConfig.ConfigType type) {
        try {
            switch (type) {
                case NUMBER -> Double.parseDouble(value);
                case BOOLEAN -> {
                    if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value)) {
                        throw new IllegalArgumentException("Invalid boolean value");
                    }
                }
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid number format for config value");
        }
    }
}

package com.krishihub.admin.service;

import com.krishihub.admin.entity.SystemSetting;
import com.krishihub.admin.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository repository;

    @PostConstruct
    public void initializeDefaults() {
        log.info("Initializing default system settings...");
        createSetting("COMPANY_NAME", "Kisan Sarathi", "Company Name", SystemSetting.SettingType.STRING, true);
        createSetting("COMPANY_TAGLINE", "Connecting Farmers directly to your Kitchen", "Main Tagline", SystemSetting.SettingType.STRING, true);
        createSetting("COMPANY_EMAIL", "info@kisansarathi.com.np", "Public Contact Email", SystemSetting.SettingType.STRING, true);
        createSetting("COMPANY_PHONE", "+977-9863249025", "Public Contact Phone", SystemSetting.SettingType.STRING, true);
        createSetting("COMPANY_LOCATION", "Kathmandu, Nepal", "Public Location", SystemSetting.SettingType.STRING, true);
        createSetting("COMPANY_LOGO", "/logo.png", "Company Logo URL", SystemSetting.SettingType.STRING, true);
        createSetting("SOCIAL_FACEBOOK", "https://facebook.com/kisansarathi", "Facebook Link", SystemSetting.SettingType.STRING, true);
        createSetting("SOCIAL_YOUTUBE", "https://youtube.com/kisansarathi", "YouTube Link", SystemSetting.SettingType.STRING, true);

        // Hero Section
        createSetting("HERO_TITLE_PREFIX", "Farmers' Companion,", "Hero Title Prefix", SystemSetting.SettingType.STRING, true);
        createSetting("HERO_TITLE_SUFFIX", "Nepal's Progress", "Hero Title Suffix", SystemSetting.SettingType.STRING, true);
        createSetting("HERO_SUBTITLE", "Get the right price for your produce. Connect directly with buyers.", "Hero Subtitle", SystemSetting.SettingType.STRING, true);
        createSetting("HERO_DESCRIPTION", "Krishi Sarathi connects farmers directly with markets. Sell crops, buy seeds/fertilizers, and get expert advice—all in one place.", "Hero Description", SystemSetting.SettingType.STRING, true);

        // About Page
        createSetting("ABOUT_TITLE", "Empowering Nepal's Agriculture", "About Page Title", SystemSetting.SettingType.STRING, true);
        createSetting("ABOUT_SUBTITLE", "Krishi Bazaar is a comprehensive digital platform connecting farmers directly with buyers.", "About Page Subtitle", SystemSetting.SettingType.STRING, true);
        createSetting("ABOUT_MISSION_DESC", "To revolutionize the agricultural landscape of Nepal by leveraging technology.", "Mission Description", SystemSetting.SettingType.STRING, true);
        createSetting("ABOUT_VISION_DESC", "A transparent, efficient, and sustainable agricultural ecosystem.", "Vision Description", SystemSetting.SettingType.STRING, true);
        
        // Contact Page
        createSetting("CONTACT_TITLE", "Get in Touch", "Contact Page Title", SystemSetting.SettingType.STRING, true);
        createSetting("CONTACT_SUBTITLE", "Have questions about Krishi Bazaar? We're here to help you grow.", "Contact Page Subtitle", SystemSetting.SettingType.STRING, true);
    }

    private void createSetting(String key, String value, String description, SystemSetting.SettingType type, boolean isPublic) {
        if (repository.findByKey(key).isEmpty()) {
            repository.save(SystemSetting.builder()
                    .key(key)
                    .value(value)
                    .description(description)
                    .type(type)
                    .isPublic(isPublic)
                    .build());
        }
    }

    public Map<String, String> getPublicSettings() {
        return repository.findByIsPublicTrue().stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    @Transactional
    public List<SystemSetting> updateSettings(List<SystemSetting> settings) {
        for (SystemSetting setting : settings) {
            repository.findByKey(setting.getKey()).ifPresent(existing -> {
                existing.setValue(setting.getValue());
                repository.save(existing);
            });
        }
        return repository.findAll();
    }

    public String getSettingValue(String key, String defaultValue) {
        return repository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }
}

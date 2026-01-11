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
    
    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findByKey(key)
                .orElseThrow(() -> new RuntimeException("Setting not found: " + key));
        setting.setValue(value);
        return repository.save(setting);
    }
}

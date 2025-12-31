package com.krishihub.config.service;

import com.krishihub.config.entity.SystemSetting;
import com.krishihub.config.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository repository;

    @PostConstruct
    public void initDefaults() {
        if (repository.count() == 0) {
            repository.save(SystemSetting.builder()
                    .key("site_maintenance_mode")
                    .value("false")
                    .description("Enable maintenance mode to disable public access")
                    .type(SystemSetting.SettingType.BOOLEAN)
                    .build());

            repository.save(SystemSetting.builder()
                    .key("allow_user_registration")
                    .value("true")
                    .description("Allow new users to register")
                    .type(SystemSetting.SettingType.BOOLEAN)
                    .build());

            repository.save(SystemSetting.builder()
                    .key("support_email")
                    .value("support@krishibazaar.com")
                    .description("Contact email for support")
                    .type(SystemSetting.SettingType.STRING)
                    .build());
        }
    }

    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = repository.findById(key)
                .orElseThrow(() -> new RuntimeException("Setting not found"));
        setting.setValue(value);
        return repository.save(setting);
    }
}

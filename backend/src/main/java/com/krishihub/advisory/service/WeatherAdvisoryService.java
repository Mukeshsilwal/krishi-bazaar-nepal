package com.krishihub.advisory.service;

import com.krishihub.advisory.entity.WeatherAdvisory;
import com.krishihub.advisory.repository.WeatherAdvisoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeatherAdvisoryService {

    private final WeatherAdvisoryRepository repository;
    private final com.krishihub.auth.repository.UserRepository userRepository;
    private final AdvisoryDeliveryLogService advisoryDeliveryLogService;

    public List<WeatherAdvisory> getAllAdvisories() {
        return repository.findAll();
    }

    public List<WeatherAdvisory> getActiveAdvisories() {
        return repository.findByActiveTrue();
    }

    @Transactional
    public WeatherAdvisory createAdvisory(WeatherAdvisory advisory) {
        if (advisory.getValidUntil() == null) {
            advisory.setValidUntil(LocalDateTime.now().plusDays(3)); // Default 3 days validity
        }
        WeatherAdvisory saved = repository.save(advisory);
        broadcastAdvisory(saved);
        return saved;
    }

    @org.springframework.scheduling.annotation.Async
    public void broadcastAdvisory(WeatherAdvisory advisory) {
        try {
            List<com.krishihub.auth.entity.User> farmers = userRepository.findByDistrictAndRole(
                    advisory.getRegion(), com.krishihub.auth.entity.User.UserRole.FARMER);

            for (com.krishihub.auth.entity.User farmer : farmers) {
                advisoryDeliveryLogService.logAdvisoryCreated(
                        farmer.getId(),
                        farmer.getName(),
                        farmer.getMobileNumber(),
                        null, // Rule ID
                        "Weather Advisory: " + advisory.getTitle(),
                        com.krishihub.advisory.enums.AdvisoryType.WEATHER,
                        mapSeverity(advisory.getAlertLevel()),
                        advisory.getDescription(),
                        farmer.getDistrict(),
                        "ALL", // Crop Type
                        "ALL", // Growth Stage
                        advisory.getTitle() // Weather Signal
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the transaction
            // log.error("Failed to broadcast advisory", e);
             System.err.println("Failed to broadcast advisory: " + e.getMessage());
        }
    }

    private com.krishihub.advisory.enums.Severity mapSeverity(WeatherAdvisory.AlertLevel level) {
        if (level == null) return com.krishihub.advisory.enums.Severity.INFO;
        switch (level) {
            case SEVERE: return com.krishihub.advisory.enums.Severity.EMERGENCY;
            case WARNING: return com.krishihub.advisory.enums.Severity.WARNING;
            case Watch: return com.krishihub.advisory.enums.Severity.WATCH;
            case NORMAL:
            default: return com.krishihub.advisory.enums.Severity.INFO;
        }
    }

    @Transactional
    public void deleteAdvisory(UUID id) {
        repository.deleteById(id);
    }
}

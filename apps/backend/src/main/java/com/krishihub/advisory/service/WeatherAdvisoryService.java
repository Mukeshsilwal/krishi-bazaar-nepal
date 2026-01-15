package com.krishihub.advisory.service;

import com.krishihub.advisory.entity.WeatherAdvisory;
import com.krishihub.advisory.repository.WeatherAdvisoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


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
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(com.krishihub.common.util.DateUtil.nowUtc());
            cal.add(java.util.Calendar.DAY_OF_YEAR, 3); // Default 3 days validity
            advisory.setValidUntil(cal.getTime());
        }
        WeatherAdvisory saved = repository.save(advisory);
        broadcastAdvisory(saved);
        return saved;
    }

    // @org.springframework.scheduling.annotation.Async // Removed to ensure synchronous execution for debugging
    public void broadcastAdvisory(WeatherAdvisory advisory) {
        try {
            List<com.krishihub.auth.entity.User> farmers = userRepository.findByDistrictAndRole(
                    advisory.getRegion(), com.krishihub.auth.entity.User.UserRole.FARMER);

            if (farmers.isEmpty()) {

                 return;
            }



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
             e.printStackTrace();
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
    public java.util.Map<String, Object> testBroadcast(String district) {
        List<com.krishihub.auth.entity.User> farmers = userRepository.findByDistrictAndRole(
                district, com.krishihub.auth.entity.User.UserRole.FARMER);
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("district", district);
        result.put("farmerCount", farmers.size());
        result.put("farmers", farmers.stream()
                .map(f -> f.getName() + " (" + f.getMobileNumber() + ")")
                .collect(java.util.stream.Collectors.toList()));
        return result;
    }
}

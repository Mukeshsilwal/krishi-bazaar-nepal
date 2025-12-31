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
        return repository.save(advisory);
    }

    @Transactional
    public void deleteAdvisory(UUID id) {
        repository.deleteById(id);
    }
}

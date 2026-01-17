package com.krishihub.finance.service;

import com.krishihub.finance.entity.GovernmentScheme;
import com.krishihub.finance.repository.GovernmentSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GovernmentSchemeService {

    private final GovernmentSchemeRepository repository;

    public List<GovernmentScheme> getAllSchemes() {
        return repository.findAll();
    }

    public org.springframework.data.domain.Page<GovernmentScheme> getAllSchemes(org.springframework.data.domain.Pageable pageable) {
        return repository.findAll(pageable);
    }

    public List<GovernmentScheme> getActiveSchemes() {
        return repository.findByActiveTrue();
    }

    public org.springframework.data.domain.Page<GovernmentScheme> getActiveSchemes(org.springframework.data.domain.Pageable pageable) {
        return repository.findByActiveTrue(pageable);
    }

    @Transactional
    public GovernmentScheme createScheme(GovernmentScheme scheme) {
        return repository.save(scheme);
    }

    @Transactional
    public GovernmentScheme updateScheme(UUID id, GovernmentScheme scheme) {
        GovernmentScheme existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheme not found"));
        existing.setTitle(scheme.getTitle());
        existing.setDescription(scheme.getDescription());
        existing.setEligibilityCriteria(scheme.getEligibilityCriteria());
        existing.setApplicationDeadline(scheme.getApplicationDeadline());
        existing.setActive(scheme.getActive());
        return repository.save(existing);
    }

    @Transactional
    public void deleteScheme(UUID id) {
        repository.deleteById(id);
    }
}

package com.krishihub.agriculturecalendar.service;

import com.krishihub.agriculturecalendar.dto.AgricultureCalendarDto;
import com.krishihub.agriculturecalendar.model.AgricultureCalendarEntry;
import com.krishihub.agriculturecalendar.model.CropType;
import com.krishihub.agriculturecalendar.model.NepaliMonth;
import com.krishihub.agriculturecalendar.repository.AgricultureCalendarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgricultureCalendarService {

    private final AgricultureCalendarRepository repository;

    @Cacheable(value = "agriculture:calendar:all")
    public List<AgricultureCalendarDto> getAllEntries(CropType crop, NepaliMonth month) {
        List<AgricultureCalendarEntry> entries;

        if (crop != null && month != null) {
            entries = repository.findByCropAndNepaliMonth(crop, month);
        } else if (crop != null) {
            entries = repository.findByCrop(crop);
        } else if (month != null) {
            entries = repository.findByNepaliMonth(month);
        } else {
            entries = repository.findAll();
        }

        return entries.stream()
                .sorted(Comparator.comparingInt(e -> e.getNepaliMonth().getOrder()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<AgricultureCalendarDto> getAllEntries(CropType crop, NepaliMonth month, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<AgricultureCalendarEntry> page;

        if (crop != null && month != null) {
            page = repository.findByCropAndNepaliMonth(crop, month, pageable);
        } else if (crop != null) {
            page = repository.findByCrop(crop, pageable);
        } else if (month != null) {
            page = repository.findByNepaliMonth(month, pageable);
        } else {
            page = repository.findAll(pageable);
        }

        return page.map(this::mapToDto);
    }

    @Transactional
    @CacheEvict(value = "agriculture:calendar:all", allEntries = true)
    public AgricultureCalendarDto createEntry(AgricultureCalendarDto dto) {
        AgricultureCalendarEntry entry = mapToEntity(dto);
        AgricultureCalendarEntry saved = repository.save(entry);
        return mapToDto(saved);
    }

    @Transactional
    @CacheEvict(value = "agriculture:calendar:all", allEntries = true)
    public AgricultureCalendarDto updateEntry(UUID id, AgricultureCalendarDto dto) {
        AgricultureCalendarEntry entry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found with ID: " + id));

        entry.setCrop(dto.getCrop());
        entry.setNepaliMonth(dto.getNepaliMonth());
        entry.setActivityType(dto.getActivityType());
        entry.setRegion(dto.getRegion());
        entry.setAdvisory(dto.getAdvisory());
        entry.setActive(dto.isActive());

        AgricultureCalendarEntry updated = repository.save(entry);
        return mapToDto(updated);
    }

    @Transactional
    @CacheEvict(value = "agriculture:calendar:all", allEntries = true)
    public void deleteEntry(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Entry not found with ID: " + id);
        }
        repository.deleteById(id);
    }

    private AgricultureCalendarDto mapToDto(AgricultureCalendarEntry entry) {
        return AgricultureCalendarDto.builder()
                .id(entry.getId())
                .crop(entry.getCrop())
                .nepaliMonth(entry.getNepaliMonth())
                .activityType(entry.getActivityType())
                .region(entry.getRegion())
                .advisory(entry.getAdvisory())
                .active(entry.isActive())
                .build();
    }

    private AgricultureCalendarEntry mapToEntity(AgricultureCalendarDto dto) {
        return AgricultureCalendarEntry.builder()
                .crop(dto.getCrop())
                .nepaliMonth(dto.getNepaliMonth())
                .activityType(dto.getActivityType())
                .region(dto.getRegion())
                .advisory(dto.getAdvisory())
                .active(dto.isActive()) // Default is true if missing, but DTO boolean checks out
                .build();
    }
}

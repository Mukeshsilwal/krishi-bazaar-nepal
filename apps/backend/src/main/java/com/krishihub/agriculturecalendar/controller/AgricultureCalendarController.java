package com.krishihub.agriculturecalendar.controller;

import com.krishihub.agriculturecalendar.dto.AgricultureCalendarDto;
import com.krishihub.agriculturecalendar.model.CropType;
import com.krishihub.agriculturecalendar.model.NepaliMonth;
import com.krishihub.agriculturecalendar.service.AgricultureCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AgricultureCalendarController {

    private final AgricultureCalendarService service;

    // Public API
    @GetMapping("/api/agriculture-calendar")
    public ResponseEntity<com.krishihub.shared.dto.PaginatedResponse<AgricultureCalendarDto>> getCalendarEntries(
            @RequestParam(required = false) CropType crop,
            @RequestParam(required = false) NepaliMonth month,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "nepaliMonth,asc") String sort) {
        
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        String sortDirection = sortParams.length > 1 ? sortParams[1] : "asc";
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, 
            size, 
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.fromString(sortDirection), 
                sortField
            )
        );

        return ResponseEntity.ok(
            com.krishihub.shared.dto.PaginatedResponse.from(service.getAllEntries(crop, month, pageable)));
    }

    // Admin APIs
    @PreAuthorize("hasAuthority('CALENDAR:MANAGE')")
    @PostMapping("/api/admin/agriculture-calendar")
    public ResponseEntity<AgricultureCalendarDto> createEntry(@RequestBody AgricultureCalendarDto dto) {
        return ResponseEntity.ok(service.createEntry(dto));
    }

    @PreAuthorize("hasAuthority('CALENDAR:MANAGE')")
    @PutMapping("/api/admin/agriculture-calendar/{id}")
    public ResponseEntity<AgricultureCalendarDto> updateEntry(
            @PathVariable UUID id,
            @RequestBody AgricultureCalendarDto dto) {
        return ResponseEntity.ok(service.updateEntry(id, dto));
    }

    @PreAuthorize("hasAuthority('CALENDAR:MANAGE')")
    @DeleteMapping("/api/admin/agriculture-calendar/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}

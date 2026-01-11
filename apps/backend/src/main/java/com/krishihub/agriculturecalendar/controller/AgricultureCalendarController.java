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
    public ResponseEntity<List<AgricultureCalendarDto>> getCalendarEntries(
            @RequestParam(required = false) CropType crop,
            @RequestParam(required = false) NepaliMonth month) {
        return ResponseEntity.ok(service.getAllEntries(crop, month));
    }

    // Admin APIs
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/agriculture-calendar")
    public ResponseEntity<AgricultureCalendarDto> createEntry(@RequestBody AgricultureCalendarDto dto) {
        return ResponseEntity.ok(service.createEntry(dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/api/admin/agriculture-calendar/{id}")
    public ResponseEntity<AgricultureCalendarDto> updateEntry(
            @PathVariable UUID id,
            @RequestBody AgricultureCalendarDto dto) {
        return ResponseEntity.ok(service.updateEntry(id, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/api/admin/agriculture-calendar/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        service.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}

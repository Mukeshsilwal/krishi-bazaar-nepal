package com.krishihub.advisory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "weather_advisories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeatherAdvisory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String region; // District or Province

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertLevel alertLevel;

    private LocalDateTime validUntil;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    private Boolean active = true;

    public enum AlertLevel {
        NORMAL,
        Watch, // Yellow
        WARNING, // Orange
        SEVERE // Red
    }
}

package com.krishihub.disease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "diseases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nameEn;
    private String nameNe;

    @Column(columnDefinition = "TEXT")
    private String symptomsEn;

    @Column(columnDefinition = "TEXT")
    private String symptomsNe;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> affectedCrops;

    @Column(columnDefinition = "TEXT")
    private String triggerConditions; // JSON string

    @CreationTimestamp
    private LocalDateTime createdAt;
}

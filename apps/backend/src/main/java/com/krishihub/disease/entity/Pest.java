package com.krishihub.disease.entity;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;
import com.krishihub.disease.enums.RiskLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "pests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nameEn;
    private String nameNe;

    @Column(columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(columnDefinition = "TEXT")
    private String descriptionNe;

    // Visual identification guide
    @Column(columnDefinition = "TEXT")
    private String identificationMarksEn;

    @Column(columnDefinition = "TEXT")
    private String identificationMarksNe;

    @ManyToMany
    @JoinTable(name = "pest_symptoms", joinColumns = @JoinColumn(name = "pest_id"), inverseJoinColumns = @JoinColumn(name = "symptom_id"))
    private List<Symptom> symptoms;

    @ManyToMany
    @JoinTable(name = "pest_treatments", joinColumns = @JoinColumn(name = "pest_id"), inverseJoinColumns = @JoinColumn(name = "treatment_id"))
    private List<Treatment> treatments;

    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> affectedCrops;

    @Column(columnDefinition = "TEXT")
    private String triggerConditions; // JSON string for rule engine context

    private String imageUrl;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;
}

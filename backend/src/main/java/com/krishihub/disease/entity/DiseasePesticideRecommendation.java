package com.krishihub.disease.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "disease_pesticide_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiseasePesticideRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "disease_id")
    private Disease disease;

    @ManyToOne
    @JoinColumn(name = "pesticide_id")
    private Pesticide pesticide;

    private String dosagePerLiter;
    private Integer sprayIntervalDays;
    private Boolean isPrimaryRecommendation;
}

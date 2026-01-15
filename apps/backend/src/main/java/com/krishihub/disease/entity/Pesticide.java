package com.krishihub.disease.entity;

import jakarta.persistence.*;
import java.util.UUID;
import com.krishihub.disease.enums.PesticideType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "pesticides")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pesticide {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nameEn;
    private String nameNe;

    @Enumerated(EnumType.STRING)
    private PesticideType type;

    private Boolean isOrganic;

    @Column(columnDefinition = "TEXT")
    private String activeIngredients;

    @Column(columnDefinition = "TEXT")
    private String safetyInstructionsEn;

    @Column(columnDefinition = "TEXT")
    private String safetyInstructionsNe;

    private String govtApprovalLicense;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;
}

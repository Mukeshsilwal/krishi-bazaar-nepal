package com.krishihub.disease.entity;

import jakarta.persistence.*;
import java.util.UUID;
import com.krishihub.disease.enums.TreatmentType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "treatments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nameEn;
    private String nameNe;

    @Enumerated(EnumType.STRING)
    private TreatmentType type; // CHEMICAL, ORGANIC, CULTURAL, MECHANICAL

    @Column(columnDefinition = "TEXT")
    private String instructionEn;

    @Column(columnDefinition = "TEXT")
    private String instructionNe;

    // For chemical/product links
    private String productId;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private java.util.Date createdAt;
}

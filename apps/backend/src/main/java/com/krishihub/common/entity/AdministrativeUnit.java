package com.krishihub.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "master_administrative_units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdministrativeUnit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nameEn;

    @Column(nullable = false)
    private String nameNe;

    @Enumerated(EnumType.STRING)
    private UnitType type; // PROVINCE, DISTRICT, MUNICIPALITY

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private AdministrativeUnit parent;

    public enum UnitType {
        PROVINCE, DISTRICT, MUNICIPALITY
    }
}

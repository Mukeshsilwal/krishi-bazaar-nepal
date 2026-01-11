package com.krishihub.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "master_crop_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CropType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nameEn;

    @Column(nullable = false)
    private String nameNe;

    private String iconUrl;

    private Boolean isActive;
}

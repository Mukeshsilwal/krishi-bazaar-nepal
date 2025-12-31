package com.krishihub.knowledge.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "knowledge_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nameEn;
    private String nameNe;
    private String slug;
    private String iconUrl;
}

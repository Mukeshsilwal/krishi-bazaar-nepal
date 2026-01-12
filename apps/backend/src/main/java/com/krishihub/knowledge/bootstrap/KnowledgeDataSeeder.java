package com.krishihub.knowledge.bootstrap;

import com.krishihub.knowledge.entity.KnowledgeCategory;
import com.krishihub.knowledge.repository.KnowledgeCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KnowledgeDataSeeder implements CommandLineRunner {

    private final KnowledgeCategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            log.info("Seeding Knowledge Categories...");

            createCategory("Crop Intelligence", "बाली जानकारी", "crop-intelligence", "plant");
            createCategory("Disease Management", "रोग व्यवस्थापन", "disease-management", "bug");
            createCategory("Pest Control", "कीरा नियन्त्रण", "pest-control", "spider");
            createCategory("Weather Advisory", "मौसम सल्लाह", "weather-advisory", "cloud-rain");
            createCategory("Agricultural Policy", "कृषि नीति", "agricultural-policy", "gavel");
            createCategory("Market Info", "बजार जानकारी", "market-info", "trending-up");

            log.info("Knowledge Categories seeded successfully.");
        }
    }

    private void createCategory(String nameEn, String nameNe, String slug, String icon) {
        KnowledgeCategory category = KnowledgeCategory.builder()
                .nameEn(nameEn)
                .nameNe(nameNe)
                .slug(slug)
                .iconUrl(icon)
                .build();
        categoryRepository.save(category);
    }
}

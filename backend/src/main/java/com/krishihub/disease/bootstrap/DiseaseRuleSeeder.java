package com.krishihub.disease.bootstrap;

import com.krishihub.advisory.dto.RuleDTO;
import com.krishihub.advisory.model.RuleAction;
import com.krishihub.advisory.model.RuleCondition;
import com.krishihub.advisory.model.RuleDefinition;
import com.krishihub.advisory.service.RuleEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DiseaseRuleSeeder implements CommandLineRunner {

        private final RuleEngineService ruleEngineService;

        @Override
        public void run(String... args) throws Exception {
                if (ruleEngineService.getAllRules().isEmpty()) {
                        seedRules();
                }
        }

        private void seedRules() {
                System.out.println("Seeding Disease Rules...");

                // Rule 1: High Humidity + Paddy -> Blast Risk
                RuleDefinition blastRisk = RuleDefinition.builder()
                                .logic("AND")
                                .conditions(List.of(
                                                RuleCondition.builder().field("crop").operator("EQUALS").value("PADDY")
                                                                .build(),
                                                RuleCondition.builder().field("humidity").operator("GT").value("85")
                                                                .build()))
                                .actions(List.of(
                                                RuleAction.builder().type("GENERATE_ADVISORY")
                                                                .payload(Map.of("disease", "Rice Blast", "severity",
                                                                                "HIGH"))
                                                                .build()))
                                .build();

                RuleDTO rule1 = RuleDTO.builder()
                                .name("Paddy Blast Risk - High Humidity")
                                .definition(blastRisk)
                                .status("ACTIVE")
                                .isActive(true)
                                .priority(10)
                                // .createdBy("SYSTEM") // Removed due to UUID type mismatch
                                .build();

                ruleEngineService.createRule(rule1);

                // Rule 2: Reported Symptom "Leaf Spot" -> Diagnose Leaf Spot
                RuleDefinition leafSpot = RuleDefinition.builder()
                                .logic("AND")
                                .conditions(List.of(
                                                RuleCondition.builder().field("symptoms").operator("CONTAINS")
                                                                .value("leaf_spot").build()))
                                .actions(List.of(
                                                RuleAction.builder().type("GENERATE_ADVISORY")
                                                                .payload(Map.of("disease", "Brown Spot", "severity",
                                                                                "MEDIUM"))
                                                                .build()))
                                .build();

                RuleDTO rule2 = RuleDTO.builder()
                                .name("Leaf Spot Diagnosis")
                                .definition(leafSpot)
                                .status("ACTIVE")
                                .isActive(true)
                                .priority(5)
                                // .createdBy("SYSTEM") // Removed due to UUID type mismatch
                                .build();

                ruleEngineService.createRule(rule2);

                System.out.println("Disease Rules Seeded.");
        }
}

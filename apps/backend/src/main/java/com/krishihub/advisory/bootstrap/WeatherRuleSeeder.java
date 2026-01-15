package com.krishihub.advisory.bootstrap;

import com.krishihub.advisory.entity.AdvisoryRule;
import com.krishihub.advisory.model.RuleAction;
import com.krishihub.advisory.model.RuleCondition;
import com.krishihub.advisory.model.RuleDefinition;
import com.krishihub.advisory.repository.AdvisoryRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;


import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Seeder for weather advisory rules
 * Creates initial rule set for common weather scenarios
 */
@Component
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class WeatherRuleSeeder implements CommandLineRunner {

    private final AdvisoryRuleRepository ruleRepository;

    // System user ID for seeded rules
    private static final UUID SYSTEM_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Override
    public void run(String... args) {
        if (ruleRepository.count() > 0) {
            log.info("Weather rules already exist. Skipping seeding.");
            return;
        }

        log.info("Seeding weather advisory rules...");

        seedWeatherRules();

        log.info("Weather advisory rules seeded successfully");
    }

    private void seedWeatherRules() {
        List<AdvisoryRule> rules = Arrays.asList(
                createHeavyRainRiceRule(),
                createHeatWaveWheatRule(),
                createFrostVegetableRule(),
                createHighHumidityRule(),
                createStormAlertRule(),
                createDroughtWarningRule(),
                createFloodRiskRule(),
                createThunderstormRule());

        ruleRepository.saveAll(rules);
        log.info("Seeded {} weather advisory rules", rules.size());
    }

    /**
     * Heavy rain + Rice crop → Flood risk advisory
     */
    private AdvisoryRule createHeavyRainRiceRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("HEAVY_RAIN_EXPECTED")
                                .build(),
                        RuleCondition.builder()
                                .field("crop_type")
                                .operator("EQUALS")
                                .value("RICE")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "HIGH",
                                        "template", "HEAVY_RAIN_RICE",
                                        "channel", "IN_APP,PUSH"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Heavy Rain - Rice Flood Risk")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(80)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Heat wave + Wheat flowering → Heat stress advisory
     */
    private AdvisoryRule createHeatWaveWheatRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("HEAT_WAVE_ALERT")
                                .build(),
                        RuleCondition.builder()
                                .field("crop_type")
                                .operator("EQUALS")
                                .value("WHEAT")
                                .build(),
                        RuleCondition.builder()
                                .field("growth_stage")
                                .operator("EQUALS")
                                .value("FLOWERING")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "EMERGENCY",
                                        "template", "HEAT_WAVE_WHEAT",
                                        "channel", "IN_APP,PUSH,SMS"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Heat Wave - Wheat Flowering Critical")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(95)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Frost risk + Vegetable seedling → Frost protection advisory
     */
    private AdvisoryRule createFrostVegetableRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("FROST_RISK")
                                .build(),
                        RuleCondition.builder()
                                .field("growth_stage")
                                .operator("EQUALS")
                                .value("SEEDLING")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "WARNING",
                                        "template", "FROST_PROTECTION",
                                        "channel", "IN_APP,PUSH"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Frost Risk - Seedling Protection")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(85)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * High humidity → Disease risk advisory
     */
    private AdvisoryRule createHighHumidityRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("HIGH_HUMIDITY_RISK")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "NORMAL",
                                        "template", "HIGH_HUMIDITY_DISEASE",
                                        "channel", "IN_APP"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("High Humidity - Disease Risk")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(60)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Storm alert → Immediate protection advisory
     */
    private AdvisoryRule createStormAlertRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("STORM_ALERT")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "EMERGENCY",
                                        "template", "STORM_PROTECTION",
                                        "channel", "IN_APP,PUSH,SMS"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Storm Alert - Immediate Action")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(100)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Drought warning → Water management advisory
     */
    private AdvisoryRule createDroughtWarningRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("DROUGHT_WARNING")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "NORMAL",
                                        "template", "DROUGHT_MANAGEMENT",
                                        "channel", "IN_APP"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Drought Warning - Water Management")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(70)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Flood risk → Emergency evacuation advisory
     */
    private AdvisoryRule createFloodRiskRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("FLOOD_RISK")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "EMERGENCY",
                                        "template", "FLOOD_EMERGENCY",
                                        "channel", "IN_APP,PUSH,SMS"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Flood Risk - Emergency Alert")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(100)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }

    /**
     * Thunderstorm → Safety advisory
     */
    private AdvisoryRule createThunderstormRule() {
        RuleDefinition definition = RuleDefinition.builder()
                .conditions(Arrays.asList(
                        RuleCondition.builder()
                                .field("weather_signal")
                                .operator("EQUALS")
                                .value("THUNDERSTORM_ALERT")
                                .build()))
                .logic("AND")
                .actions(Arrays.asList(
                        RuleAction.builder()
                                .type("SEND_NOTIFICATION")
                                .payload(Map.of(
                                        "priority", "HIGH",
                                        "template", "THUNDERSTORM_SAFETY",
                                        "channel", "IN_APP,PUSH"))
                                .build()))
                .build();

        return AdvisoryRule.builder()
                .name("Thunderstorm - Safety Alert")
                .definition(definition)
                .ruleType("WEATHER")
                .status("ACTIVE")
                .isActive(true)
                .version(1)
                .priority(90)
                .effectiveFrom(com.krishihub.common.util.DateTimeProvider.now())
                .createdBy(SYSTEM_USER_ID)
                .build();
    }
}

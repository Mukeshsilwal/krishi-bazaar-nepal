package com.krishihub.disease.signal;

import com.krishihub.disease.model.SignalPayload;
import com.krishihub.advisory.service.RuleEngineService;
import com.krishihub.advisory.model.RuleResult;
import com.krishihub.disease.advisory.AdvisoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class SignalIngestionService {

    private final RuleEngineService ruleEngineService;
    private final AdvisoryService advisoryService;

    public void processSignal(SignalPayload signal) {
        // 1. Enrich Context
        Map<String, Object> context = buildContext(signal);

        // 2. Evaluate Rules
        List<RuleResult> results = ruleEngineService.executeRules(context);

        // 3. Process Outcomes (Advisory/Alert)
        processRuleResults(results, signal);
    }

    private Map<String, Object> buildContext(SignalPayload signal) {
        Map<String, Object> context = new HashMap<>();
        context.put("signalType", signal.getType().name());
        context.put("crop", signal.getCropName());
        context.put("stage", signal.getGrowthStage());
        context.put("district", signal.getDistrict());

        if (signal.getSymptomCodes() != null) {
            context.put("symptoms", signal.getSymptomCodes());
        }

        if (signal.getTemperature() != null)
            context.put("temperature", signal.getTemperature());
        if (signal.getHumidity() != null)
            context.put("humidity", signal.getHumidity());

        return context;
    }

    private void processRuleResults(List<RuleResult> results, SignalPayload signal) {
        for (RuleResult result : results) {
            advisoryService.handleRuleResult(result, signal);
        }
    }
}

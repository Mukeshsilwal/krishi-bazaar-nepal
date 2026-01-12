package com.krishihub.advisory.service;

import com.krishihub.advisory.model.RuleAction;
import com.krishihub.advisory.model.RuleResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleOrchestratorService {

    private final RuleEngineService ruleEngineService;
    private final List<ActionExecutor> actionExecutors;

    public void runRules(Map<String, Object> context) {
        log.info("Running rules for context: {}", context);
        List<RuleResult> results = ruleEngineService.executeRules(context);

        for (RuleResult result : results) {
            if (result.isTriggered() && result.getActions() != null) {
                for (RuleAction action : result.getActions()) {
                    executeAction(action);
                }
            }
        }
    }

    private void executeAction(RuleAction action) {
        for (ActionExecutor executor : actionExecutors) {
            if (executor.supports(action.getType())) {
                try {
                    executor.execute(action);
                } catch (Exception e) {
                    log.error("Error executing action {} with executor {}", action, executor.getClass().getSimpleName(),
                            e);
                }
            }
        }
    }
}

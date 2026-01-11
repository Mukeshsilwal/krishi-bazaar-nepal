package com.krishihub.advisory.service;

import com.krishihub.advisory.model.RuleAction;

public interface ActionExecutor {
    void execute(RuleAction action);

    boolean supports(String actionType);
}

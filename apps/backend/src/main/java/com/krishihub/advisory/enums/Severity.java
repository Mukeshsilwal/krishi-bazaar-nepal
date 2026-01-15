package com.krishihub.advisory.enums;

import lombok.Getter;

@Getter
public enum Severity {
    INFO(1),
    WATCH(2),
    WARNING(3),
    CRITICAL(5),
    EMERGENCY(10); // Matches usage

    private final int priority;

    Severity(int priority) {
        this.priority = priority;
    }
}

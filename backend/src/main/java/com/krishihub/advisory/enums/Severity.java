package com.krishihub.advisory.enums;

/**
 * Severity Level Enumeration
 * Defines priority levels for advisory routing and alert escalation
 */
public enum Severity {
    /**
     * Informational advisory - no immediate action required
     */
    INFO(1, "Info", "जानकारी"),

    /**
     * Watch advisory - monitor situation
     */
    WATCH(2, "Watch", "निगरानी"),

    /**
     * Warning advisory - prepare for action
     */
    WARNING(3, "Warning", "चेतावनी"),

    /**
     * Emergency advisory - immediate action required
     */
    EMERGENCY(4, "Emergency", "आपतकालीन");

    private final int priority;
    private final String displayNameEn;
    private final String displayNameNe;

    Severity(int priority, String displayNameEn, String displayNameNe) {
        this.priority = priority;
        this.displayNameEn = displayNameEn;
        this.displayNameNe = displayNameNe;
    }

    public int getPriority() {
        return priority;
    }

    public String getDisplayNameEn() {
        return displayNameEn;
    }

    public String getDisplayNameNe() {
        return displayNameNe;
    }

    /**
     * Check if this severity requires immediate action
     */
    public boolean requiresImmediateAction() {
        return this == WARNING || this == EMERGENCY;
    }
}

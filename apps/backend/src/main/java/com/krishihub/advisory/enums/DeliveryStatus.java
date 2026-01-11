package com.krishihub.advisory.enums;

/**
 * Delivery Status Enumeration
 * Tracks the complete lifecycle of an advisory from creation to farmer feedback
 */
public enum DeliveryStatus {
    /**
     * Advisory decision logged, not yet dispatched
     */
    CREATED("Created", "सिर्जना गरिएको"),

    /**
     * Advisory dispatched to notification service
     */
    DISPATCHED("Dispatched", "पठाइएको"),

    /**
     * Advisory successfully delivered to farmer's device
     */
    DELIVERED("Delivered", "डेलिभर गरिएको"),

    /**
     * Farmer opened/viewed the advisory
     */
    OPENED("Opened", "खोलिएको"),

    /**
     * Farmer provided feedback on the advisory
     */
    FEEDBACK_RECEIVED("Feedback Received", "प्रतिक्रिया प्राप्त"),

    // Failure states

    /**
     * Delivery failed (network, service error, etc.)
     */
    DELIVERY_FAILED("Delivery Failed", "डेलिभरी असफल"),

    /**
     * Channel disabled for this farmer
     */
    CHANNEL_DISABLED("Channel Disabled", "च्यानल असक्षम"),

    /**
     * Advisory was deduplicated (prevented storm)
     */
    DEDUPED("Deduplicated", "डुप्लिकेट हटाइएको"),

    /**
     * Advisory expired before delivery
     */
    EXPIRED("Expired", "म्याद सकिएको");

    private final String displayNameEn;
    private final String displayNameNe;

    DeliveryStatus(String displayNameEn, String displayNameNe) {
        this.displayNameEn = displayNameEn;
        this.displayNameNe = displayNameNe;
    }

    public String getDisplayNameEn() {
        return displayNameEn;
    }

    public String getDisplayNameNe() {
        return displayNameNe;
    }

    /**
     * Check if this is a success state
     */
    public boolean isSuccess() {
        return this == DELIVERED || this == OPENED || this == FEEDBACK_RECEIVED;
    }

    /**
     * Check if this is a failure state
     */
    public boolean isFailure() {
        return this == DELIVERY_FAILED || this == CHANNEL_DISABLED || this == EXPIRED;
    }

    /**
     * Check if this status can transition to the target status
     */
    public boolean canTransitionTo(DeliveryStatus target) {
        return switch (this) {
            case CREATED -> target == DISPATCHED || target == DEDUPED || target == EXPIRED;
            case DISPATCHED -> target == DELIVERED || target == DELIVERY_FAILED || target == CHANNEL_DISABLED;
            case DELIVERED -> target == OPENED || target == EXPIRED;
            case OPENED -> target == FEEDBACK_RECEIVED;
            case FEEDBACK_RECEIVED, DELIVERY_FAILED, CHANNEL_DISABLED, DEDUPED, EXPIRED -> false;
        };
    }
}

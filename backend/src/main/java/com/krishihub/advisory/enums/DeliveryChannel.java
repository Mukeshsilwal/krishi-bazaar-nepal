package com.krishihub.advisory.enums;

/**
 * Delivery Channel Enumeration
 * Defines available channels for advisory delivery
 */
public enum DeliveryChannel {
    /**
     * SMS text message
     */
    SMS("SMS", "एसएमएस"),

    /**
     * Push notification to mobile app
     */
    PUSH("Push Notification", "पुश सूचना"),

    /**
     * In-app notification (viewed within app)
     */
    IN_APP("In-App", "एप भित्र");

    private final String displayNameEn;
    private final String displayNameNe;

    DeliveryChannel(String displayNameEn, String displayNameNe) {
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
     * Check if this channel supports delivery confirmation
     */
    public boolean supportsDeliveryConfirmation() {
        return this == PUSH || this == IN_APP;
    }

    /**
     * Check if this channel supports read receipts
     */
    public boolean supportsReadReceipts() {
        return this == IN_APP;
    }
}

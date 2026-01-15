package com.krishihub.advisory.enums;

public enum DeliveryStatus {
    CREATED,
    DEDUPED,
    PENDING,
    DISPATCHED,
    SENT,
    DELIVERED,
    OPENED,
    FEEDBACK_RECEIVED,
    FAILED,
    DELIVERY_FAILED;

    public boolean canTransitionTo(DeliveryStatus newStatus) {
        // Simple logic for now, allow forward progression
        return this.ordinal() <= newStatus.ordinal(); 
    }
}

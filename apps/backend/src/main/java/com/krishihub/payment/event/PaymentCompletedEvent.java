package com.krishihub.payment.event;

import com.krishihub.payment.entity.Transaction;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PaymentCompletedEvent extends ApplicationEvent {
    private final Transaction transaction;

    public PaymentCompletedEvent(Object source, Transaction transaction) {
        super(source);
        this.transaction = transaction;
    }
}

package com.krishihub.payment.dto;

import com.krishihub.payment.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {
    private UUID id;
    private UUID orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private Date createdAt;

    public static TransactionDto fromEntity(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .orderId(transaction.getOrder().getId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : null)
                .paymentStatus(transaction.getPaymentStatus().name())
                .transactionId(transaction.getTransactionId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}

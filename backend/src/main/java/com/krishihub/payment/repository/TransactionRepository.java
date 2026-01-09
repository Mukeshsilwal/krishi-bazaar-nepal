package com.krishihub.payment.repository;

import com.krishihub.payment.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByOrderId(UUID orderId);

    Optional<Transaction> findByTransactionId(String transactionId);

    Optional<Transaction> findByOrderIdAndPaymentStatus(UUID orderId, Transaction.PaymentStatus status);

    List<Transaction> findByPaymentStatusAndCreatedAtBefore(Transaction.PaymentStatus status,
                                                           java.time.LocalDateTime createdAt);
}

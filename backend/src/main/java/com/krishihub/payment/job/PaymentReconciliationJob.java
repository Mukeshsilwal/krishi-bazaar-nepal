package com.krishihub.payment.job;

import com.krishihub.payment.entity.Transaction;
import com.krishihub.payment.repository.TransactionRepository;
import com.krishihub.payment.service.PaymentVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReconciliationJob {

    private final TransactionRepository transactionRepository;
    private final PaymentVerificationService verificationService;

    @Scheduled(fixedDelayString = "${payment.reconciliation.interval:300000}") // Every 5 mins
    public void reconcilePendingPayments() {
        log.info("Starting payment reconciliation job...");

        // Fetch pending transactions created > 5 mins ago (to allow immediate user redirected verification to happen first)
        LocalDateTime cutOffTime = LocalDateTime.now().minusMinutes(5);
        List<Transaction> pendingTransactions = transactionRepository.findByPaymentStatusAndCreatedAtBefore(
                Transaction.PaymentStatus.PENDING, cutOffTime);

        log.info("Found {} pending transactions to reconcile", pendingTransactions.size());

        for (Transaction txn : pendingTransactions) {
            verificationService.verifyTransaction(txn);
        }

        log.info("Payment reconciliation job completed.");
    }
}

package com.krishihub.payment.service;

import com.krishihub.payment.entity.Transaction;
import com.krishihub.payment.repository.TransactionRepository;
import com.krishihub.payment.service.strategy.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService {

    private final TransactionRepository transactionRepository;
    private final PaymentService paymentService;
    private final List<PaymentStrategy> paymentStrategies;
    private Map<Transaction.PaymentMethod, PaymentStrategy> strategyMap;

    @jakarta.annotation.PostConstruct
    public void init() {
        strategyMap = new EnumMap<>(Transaction.PaymentMethod.class);
        for (PaymentStrategy strategy : paymentStrategies) {
            strategyMap.put(strategy.getPaymentMethod(), strategy);
        }
    }

    private PaymentStrategy getStrategy(Transaction.PaymentMethod method) {
        return strategyMap.get(method);
    }

    /**
     * Verifies a single transaction with the gateway.
     * Returns true if verification successful and status updated (or already completed).
     */
    @Transactional
    public boolean verifyTransaction(Transaction transaction) {
        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.COMPLETED) {
            return true;
        }

        try {
            boolean verified = false;
            String gatewayTxnId = transaction.getTransactionId(); 
            PaymentStrategy strategy = getStrategy(transaction.getPaymentMethod());

            if (strategy != null) {
                 String verifyId = gatewayTxnId;
                 if (transaction.getPaymentMethod() == Transaction.PaymentMethod.ESEWA) {
                     // eSewa fallback logic
                     verifyId = transaction.getOrder().getId().toString();
                 }
                 
                 // If ID is still null (e.g. Khalti init failed and no PIDX saved), we can't verify
                 if (verifyId != null) {
                    verified = strategy.verifyPayment(verifyId, transaction.getAmount());
                 }
            }

            if (verified) {
                 // Reuse PaymentService to finalize
                 // We pass the ID we used for verification as the gateway ID
                 String confirmId = gatewayTxnId;
                 if (transaction.getPaymentMethod() == Transaction.PaymentMethod.ESEWA) {
                     confirmId = transaction.getOrder().getId().toString();
                 }
                 
                 paymentService.verifyPayment(transaction.getId(), confirmId);
                 return true;
            } else {
                 log.debug("Verification failed for txn {}", transaction.getId());
            }

        } catch (Exception e) {
            log.error("Error verifying transaction {}", transaction.getId(), e);
        }
        return false;
    }
}

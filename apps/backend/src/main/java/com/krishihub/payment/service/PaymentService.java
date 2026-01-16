package com.krishihub.payment.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.order.entity.Order;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.payment.dto.InitiatePaymentRequest;
import com.krishihub.payment.dto.PaymentResponse;
import com.krishihub.payment.dto.TransactionDto;
import com.krishihub.payment.entity.Transaction;
import com.krishihub.payment.event.PaymentCompletedEvent;
import com.krishihub.payment.repository.TransactionRepository;
import com.krishihub.payment.service.strategy.PaymentInitiationResult;
import com.krishihub.payment.service.strategy.PaymentStrategy;
import com.krishihub.payment.service.strategy.PaymentVerificationResult;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final TransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.krishihub.order.service.OrderService orderService;
    private final PaymentStrategy esewaPaymentStrategy;
    // PaymentStrategy khaltiPaymentStrategy; // If exists
    
    private final List<PaymentStrategy> paymentStrategies;
    private Map<Transaction.PaymentMethod, PaymentStrategy> strategyMap;

    @PostConstruct
    public void init() {
        strategyMap = new EnumMap<>(Transaction.PaymentMethod.class);
        // Explicitly populate to guarantee they are registered
        if (esewaPaymentStrategy != null) {
             strategyMap.put(Transaction.PaymentMethod.ESEWA, esewaPaymentStrategy);
        }
        
        // Also iterate list for others
        for (PaymentStrategy strategy : paymentStrategies) {
            strategyMap.put(strategy.getPaymentMethod(), strategy);
        }
        log.info("Loaded Payment Strategies: {}", strategyMap.keySet());
    }

    private PaymentStrategy getStrategy(Transaction.PaymentMethod method) {
        // Debug
        // log.info("Requesting strategy for: {}", method);
        PaymentStrategy strategy = strategyMap.get(method);
        if (strategy == null) {
            log.error("Strategy NOT found for method: {}. Available: {}", method, strategyMap.keySet());
            throw new BadRequestException("Payment method not supported: " + method);
        }
        return strategy;
    }

    public PaymentResponse initiatePayment(UUID userId, InitiatePaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only pay for your own orders");
        }

        if (order.getStatus() != OrderStatus.CONFIRMED &&
                order.getStatus() != OrderStatus.PAYMENT_PENDING &&
                order.getStatus() != OrderStatus.READY) {
            throw new BadRequestException("Order is not ready for payment");
        }

        transactionRepository.findByOrderIdAndPaymentStatus(
                order.getId(), Transaction.PaymentStatus.COMPLETED).ifPresent(t -> {
            throw new BadRequestException("Payment already completed for this order");
        });

        Transaction.PaymentMethod paymentMethod;
        try {
            paymentMethod = Transaction.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getPaymentMethod());
        }

        Transaction transaction = Transaction.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(paymentMethod)
                .paymentStatus(Transaction.PaymentStatus.PENDING)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        // Delegate to Strategy
        PaymentInitiationResult result = getStrategy(paymentMethod).initiatePayment(order.getId(), order.getTotalAmount());

        if (result.getTransactionId() != null) {
            savedTransaction.setTransactionId(result.getTransactionId());
            transactionRepository.save(savedTransaction);
        }

        log.info("Payment initiated: {} for order: {}", savedTransaction.getId(), order.getId());

        return PaymentResponse.builder()
                .transactionId(savedTransaction.getId())
                .paymentUrl(result.getPaymentUrl())
                .paymentMethod(paymentMethod.name())
                .status("PENDING")
                .message("Payment initiated successfully")
                .amount(order.getTotalAmount())
                .data(result.getPaymentData())
                .build();
    }

    @Transactional
    public TransactionDto verifyPayment(String identifier, String gatewayTransactionId) {
        // 1. Try to find by transactionId (String)
        Transaction transaction = transactionRepository.findByTransactionId(identifier).orElse(null);

        // 2. If not found, try to treat identifier as UUID (PK or Order ID)
        if (transaction == null) {
            try {
                UUID uuid = UUID.fromString(identifier);
                transaction = transactionRepository.findById(uuid).orElse(null);
                
                if (transaction == null) {
                    List<Transaction> transactions = transactionRepository.findByOrderId(uuid);
                    if (!transactions.isEmpty()) {
                         transaction = transactions.stream()
                                .min((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                                .orElse(null);
                    }
                }
            } catch (IllegalArgumentException e) {
                // Not a valid UUID
            }
        }

        if (transaction == null) {
             throw new ResourceNotFoundException("Transaction not found for identifier: " + identifier);
        }

        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.COMPLETED) {
            return TransactionDto.fromEntity(transaction);
        }

        boolean verified;
        try {
            // Use Strategy for verification
            String verificationId = getVerificationId(gatewayTransactionId, transaction);

            PaymentVerificationResult result = getStrategy(transaction.getPaymentMethod()).verifyPayment(
                    verificationId,
                    transaction.getAmount()
            );

            verified = result.isSuccess();
            transaction.setGatewayResponse(result.getRawResponse());
            
            if (verified) {
                transaction.setPaymentStatus(Transaction.PaymentStatus.COMPLETED);
                // Use the transaction ID from the gateway if available (e.g. eSewa refId)
                if (result.getTransactionId() != null && !result.getTransactionId().isEmpty() && !"N/A".equals(result.getTransactionId())) {
                    transaction.setTransactionId(result.getTransactionId());
                } else if (gatewayTransactionId != null) {
                    transaction.setTransactionId(gatewayTransactionId);
                }
                
                transactionRepository.save(transaction);

                orderService.updatePaymentStatus(transaction.getOrder().getId(), OrderStatus.PAID);
                eventPublisher.publishEvent(new PaymentCompletedEvent(this, transaction));

            } else {
                transaction.setPaymentStatus(Transaction.PaymentStatus.FAILED);
                // We already set gatewayResponse above
                if (result.getFailureReason() != null) {
                    // Append failure reason to response if needed, or rely on raw response
                    // Let's just log it
                    log.warn("Payment verification failed reason: {}", result.getFailureReason());
                }
                transactionRepository.save(transaction);
                throw new BadRequestException("Payment verification failed: " + (result.getFailureReason() != null ? result.getFailureReason() : "Unknown error"));
            }

            return TransactionDto.fromEntity(transaction);

        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            transaction.setPaymentStatus(Transaction.PaymentStatus.FAILED);
            // transaction.setGatewayResponse(e.getMessage()); // Don't overwrite if we have partial response, but here e is exception
            // If rawResponse was set before exception, fine. If not, maybe set exception message?
            // Safer to leave what was set or append.
            if (transaction.getGatewayResponse() == null) {
                transaction.setGatewayResponse("Exception: " + e.getMessage());
            }
            transactionRepository.save(transaction);
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }


    }

    private static String getVerificationId(String gatewayTransactionId, Transaction transaction) {
        String verificationId;
        // For eSewa, we use the stored unique transaction ID (which includes suffix)
        if (transaction.getPaymentMethod() == Transaction.PaymentMethod.ESEWA &&
            transaction.getTransactionId() != null && !transaction.getTransactionId().isEmpty()) {
            verificationId = transaction.getTransactionId();
        } else if (transaction.getPaymentMethod() == Transaction.PaymentMethod.ESEWA) {
            // Fallback to Order ID if transaction ID not set (legacy behavior)
            verificationId = transaction.getOrder().getId().toString();
        } else {
            // For others (like Khalti), use the gateway provided ID (pidx) if avail, else fallback
            verificationId = (gatewayTransactionId != null && !gatewayTransactionId.trim().isEmpty())
                    ? gatewayTransactionId
                    : transaction.getOrder().getId().toString();
        }
        return verificationId;
    }

    public TransactionDto getTransaction(UUID id, UUID userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = transaction.getOrder();
        if (!order.getBuyer().getId().equals(user.getId()) &&
                !order.getFarmer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't have access to this transaction");
        }

        return TransactionDto.fromEntity(transaction);
    }
}

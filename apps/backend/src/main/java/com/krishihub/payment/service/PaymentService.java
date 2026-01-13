package com.krishihub.payment.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.order.dto.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.payment.dto.InitiatePaymentRequest;
import com.krishihub.payment.dto.PaymentResponse;
import com.krishihub.payment.dto.TransactionDto;
import com.krishihub.payment.entity.Transaction;
import com.krishihub.payment.event.PaymentCompletedEvent;
import com.krishihub.payment.repository.TransactionRepository;
import com.krishihub.payment.service.strategy.PaymentInitiationResult;
import com.krishihub.payment.service.strategy.PaymentStrategy;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
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
        PaymentStrategy strategy = strategyMap.get(method);
        if (strategy == null) {
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

        // Update transaction with gateway specific ID (pidx etc)
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
    public TransactionDto verifyPayment(UUID transactionId, String gatewayTransactionId) {
        Transaction transaction = transactionRepository.findById(transactionId).orElse(null);

        if (transaction == null) {
            List<Transaction> transactions = transactionRepository.findByOrderId(transactionId);
            if (transactions.isEmpty()) {
                throw new ResourceNotFoundException("Transaction not found for ID or Order ID: " + transactionId);
            }
            transaction = transactions.stream()
                    .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        }

        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.COMPLETED) {
            return TransactionDto.fromEntity(transaction);
        }

        boolean verified;
        try {
            // Use Strategy for verification
            // For eSewa, if gatewayTransactionId is missing/null, it might use orderId or amount logic internally.
            // But here we pass exactly what we have.
            verified = getStrategy(transaction.getPaymentMethod()).verifyPayment(
                    gatewayTransactionId != null ? gatewayTransactionId : transaction.getOrder().getId().toString(),
                    transaction.getAmount()
            );
        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            transaction.setPaymentStatus(Transaction.PaymentStatus.FAILED);
            transaction.setGatewayResponse(e.getMessage());
            transactionRepository.save(transaction);
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }

        if (verified) {
            transaction.setPaymentStatus(Transaction.PaymentStatus.COMPLETED);
            if (gatewayTransactionId != null) {
                transaction.setTransactionId(gatewayTransactionId);
            }
            transactionRepository.save(transaction);

            orderService.updatePaymentStatus(transaction.getOrder().getId(), OrderStatus.PAID);
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, transaction));

            log.info("Payment verified and completed: {}", transactionId);
        } else {
            transaction.setPaymentStatus(Transaction.PaymentStatus.FAILED);
            transactionRepository.save(transaction);
            throw new BadRequestException("Payment verification failed");
        }

        return TransactionDto.fromEntity(transaction);
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

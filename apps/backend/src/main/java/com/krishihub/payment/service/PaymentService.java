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
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final EsewaPaymentService esewaService;
    private final KhaltiPaymentService khaltiService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.krishihub.order.service.OrderService orderService;


    public PaymentResponse initiatePayment(UUID userId, InitiatePaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify user is the buyer
        if (!order.getBuyer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only pay for your own orders");
        }

        // Verify order status
        if (order.getStatus() != OrderStatus.CONFIRMED &&
                order.getStatus() != OrderStatus.PAYMENT_PENDING &&
                order.getStatus() != OrderStatus.READY) {
            throw new BadRequestException("Order is not ready for payment");
        }

        // Check if payment already exists
        transactionRepository.findByOrderIdAndPaymentStatus(
                order.getId(), Transaction.PaymentStatus.COMPLETED).ifPresent(t -> {
            throw new BadRequestException("Payment already completed for this order");
        });

        // Parse payment method
        Transaction.PaymentMethod paymentMethod;
        try {
            paymentMethod = Transaction.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method: " + request.getPaymentMethod());
        }

        // Create transaction record
        Transaction transaction = Transaction.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .paymentMethod(paymentMethod)
                .paymentStatus(Transaction.PaymentStatus.PENDING)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update order status
        order.setStatus(OrderStatus.PAYMENT_PENDING);
        orderRepository.save(order);

        // Initiate payment with gateway
        String paymentUrl = null;
        Map<String, Object> paymentData = null;

        try {
            if (paymentMethod == Transaction.PaymentMethod.ESEWA) {
                Map<String, Object> esewaResponse = esewaService.initiatePayment(order.getId(), order.getTotalAmount());
                paymentData = esewaResponse;
                // For backward compatibility, set paymentUrl to a placeholder
                paymentUrl = "esewa-redirect";
            } else if (paymentMethod == Transaction.PaymentMethod.KHALTI) {
                Map<String, Object> khaltiResponse = khaltiService.initiatePayment(
                        order.getId(), order.getTotalAmount());
                paymentUrl = (String) khaltiResponse.get("payment_url");
                savedTransaction.setTransactionId((String) khaltiResponse.get("pidx"));
                transactionRepository.save(savedTransaction);
            } else {
                throw new BadRequestException("Payment method not supported");
            }
        } catch (Exception e) {
            log.error("Failed to initiate payment: {}", e.getMessage());
            throw new BadRequestException("Failed to initiate payment: " + e.getMessage());
        }

        log.info("Payment initiated: {} for order: {}", savedTransaction.getId(), order.getId());

        return PaymentResponse.builder()
                .transactionId(savedTransaction.getId())
                .paymentUrl(paymentUrl)
                .paymentMethod(paymentMethod.name())
                .status("PENDING")
                .message("Payment initiated successfully")
                .amount(order.getTotalAmount())
                .data(paymentData)
                .build();
    }

    @Transactional
    public TransactionDto verifyPayment(UUID transactionId, String gatewayTransactionId) {
        // Try to find by Transaction ID first
        Transaction transaction = transactionRepository.findById(transactionId).orElse(null);

        if (transaction == null) {
            // Assume transactionId might be an Order ID (eSewa sends Order ID as transaction_uuid)
            List<Transaction> transactions = transactionRepository.findByOrderId(transactionId);

            if (transactions.isEmpty()) {
                throw new ResourceNotFoundException("Transaction not found for ID or Order ID: " + transactionId);
            }

            // Get the latest transaction for this order
            transaction = transactions.stream()
                    .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        }

        if (transaction.getPaymentStatus() == Transaction.PaymentStatus.COMPLETED) {
            return TransactionDto.fromEntity(transaction);
        }

        // Verify with gateway
        boolean verified = false;
        try {
            if (transaction.getPaymentMethod() == Transaction.PaymentMethod.ESEWA) {
                // eSewa verification requires the exact ID sent during initiation (which was
                // Order ID)
                verified = esewaService.verifyPayment(transaction.getOrder().getId().toString(),
                        transaction.getAmount());
            } else if (transaction.getPaymentMethod() == Transaction.PaymentMethod.KHALTI) {
                verified = khaltiService.verifyPayment(gatewayTransactionId);
            }
        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            transaction.setPaymentStatus(Transaction.PaymentStatus.FAILED);
            transaction.setGatewayResponse(e.getMessage());
            transactionRepository.save(transaction);
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }

        if (verified) {
            transaction.setPaymentStatus(Transaction.PaymentStatus.COMPLETED);
            transaction.setTransactionId(gatewayTransactionId);
            transactionRepository.save(transaction);

            // Update order status via OrderService (handles stock reduction etc.)
            orderService.updatePaymentStatus(transaction.getOrder().getId(), OrderStatus.PAID);

            // Send notifications event
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

        // Verify access
        Order order = transaction.getOrder();
        if (!order.getBuyer().getId().equals(user.getId()) &&
                !order.getFarmer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't have access to this transaction");
        }

        return TransactionDto.fromEntity(transaction);
    }
}

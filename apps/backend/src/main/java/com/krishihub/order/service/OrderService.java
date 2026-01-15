package com.krishihub.order.service;

import com.krishihub.agristore.repository.AgriProductRepository;
import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;

import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.order.dto.*;
import com.krishihub.order.enums.OrderSource;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.event.OrderCancelledEvent;
import com.krishihub.order.event.OrderPlacedEvent;
import com.krishihub.order.event.OrderStatusChangedEvent;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.order.service.strategy.OrderProcessingStrategy;
import com.krishihub.order.validator.OrderStateValidator;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderStateValidator orderStateValidator;
    private final ApplicationEventPublisher eventPublisher;

    private final List<OrderProcessingStrategy> orderStrategies;
    private Map<OrderSource, OrderProcessingStrategy> strategyMap;

    @jakarta.annotation.PostConstruct
    public void init() {
        strategyMap = new EnumMap<>(OrderSource.class);
        for (OrderProcessingStrategy strategy : orderStrategies) {
            strategyMap.put(strategy.getOrderSource(), strategy);
        }
    }

    private OrderProcessingStrategy getStrategy(OrderSource source) {
        OrderProcessingStrategy strategy = strategyMap.get(source);
        if (strategy == null) {
            throw new BadRequestException("Order source not supported: " + source);
        }
        return strategy;
    }

    @Transactional
    public OrderDto createOrder(UUID userId, CreateOrderRequest request) {
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (buyer.getRole() != User.UserRole.BUYER && buyer.getRole() != User.UserRole.FARMER) {
            throw new BadRequestException("Only buyers and farmers can place orders");
        }
        
        // Use default if not provided
        OrderSource source = request.getOrderSource() != null ? request.getOrderSource() : OrderSource.MARKETPLACE;
        request.setOrderSource(source);

        Order order = getStrategy(source).createOrder(buyer, request);

        Order savedOrder = orderRepository.save(order);

        // Send notification event
        eventPublisher.publishEvent(new OrderPlacedEvent(this, savedOrder));

        log.info("Order created: {} by buyer: {} Source: {}", savedOrder.getId(), userId, source);

        return OrderDto.fromEntity(savedOrder);
    }
    
    public OrderDto getOrderById(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify access (buyer or farmer)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!order.getBuyer().getId().equals(user.getId()) &&
                (order.getFarmer() == null || !order.getFarmer().getId().equals(user.getId()))) {
             if (user.getRole() != User.UserRole.ADMIN) { 
                throw new UnauthorizedException("You don't have access to this order");
             }
        }

        return OrderDto.fromEntity(order);
    }

    public Page<OrderDto> getMyOrders(UUID userId, String role, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orders;

        if ("buyer".equalsIgnoreCase(role)) {
            orders = orderRepository.findByBuyerId(user.getId(), pageable);
        } else if ("farmer".equalsIgnoreCase(role)) {
            orders = orderRepository.findByFarmerId(user.getId(), pageable);
        } else {
            orders = orderRepository.findByBuyerIdOrFarmerId(user.getId(), user.getId(), pageable);
        }

        return orders.map(OrderDto::fromEntity);
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID id, UUID userId, UpdateOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify access
        boolean isBuyer = order.getBuyer().getId().equals(user.getId());
        boolean isFarmer = order.getFarmer() != null && order.getFarmer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.UserRole.ADMIN;

        if (!isBuyer && !isFarmer && !isAdmin) {
             throw new UnauthorizedException("You don't have access to this order");
        }

        // Update status if provided
        if (request.getStatus() != null) {
            OrderStatus newStatus;
            try {
                newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }

            // Validate status transitions
            orderStateValidator.validateTransition(order.getStatus(), newStatus);

            OrderStatus oldStatus = order.getStatus();
            order.setStatus(newStatus);
            
            // Centralized Stock Logic -> Delegated to Strategy
            OrderProcessingStrategy strategy = getStrategy(order.getOrderSource());

            if (newStatus == OrderStatus.PAID) {
                strategy.handlePaymentCompletion(order);
            } else if ((oldStatus == OrderStatus.PAID) && (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.FAILED)) {
                strategy.handleOrderCancellation(order);
            }

            // Send notifications event
            eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order, oldStatus, newStatus));
        }

        // Update other fields
        if (request.getPickupDate() != null) {
            // Assuming strict YYYY-MM-DD format from frontend
            order.setPickupDate(java.sql.Date.valueOf(request.getPickupDate()));
        }
        if (request.getPickupLocation() != null) {
            order.setPickupLocation(request.getPickupLocation());
        }
        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        Order updated = orderRepository.save(order);
        log.info("Order updated: {} by {}", id, userId);

        return OrderDto.fromEntity(updated);
    }

    @Transactional
    public void cancelOrder(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only buyer can cancel before confirmation, both can cancel after
        boolean isBuyer = order.getBuyer().getId().equals(user.getId());
        boolean isFarmer = order.getFarmer() != null && order.getFarmer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.UserRole.ADMIN;

        if (!isBuyer && !isFarmer && !isAdmin) {
             throw new UnauthorizedException("You don't have access to this order");
        }

        // Validate cancellation
        orderStateValidator.validateTransition(order.getStatus(), OrderStatus.CANCELLED);
        
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        
        // Restore stock if it was PAID -> Delegated to Strategy
        if (oldStatus == OrderStatus.PAID) {
             getStrategy(order.getOrderSource()).handleOrderCancellation(order);
        }
        
        orderRepository.save(order);

        // Send notification event
        String reason = "User requested cancellation";
        eventPublisher.publishEvent(new OrderCancelledEvent(this, order, reason));

        log.info("Order cancelled: {} by {}", id, userId);
    }

    @Transactional
    public void updatePaymentStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Validate transition
        orderStateValidator.validateTransition(order.getStatus(), status);

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);

        // Centralized Stock Logic -> Delegated to Strategy
        OrderProcessingStrategy strategy = getStrategy(order.getOrderSource());

        if (status == OrderStatus.PAID) {
             strategy.handlePaymentCompletion(order);
        }
        // Note: For cancellation/failure from payment status update, we might also need handling if we revert PAID to something else.
        // But usually updatePaymentStatus is PENDING -> PAID or PENDING -> FAILED.
        // If we move from PAID -> REFUNDED/FAILED, we should probably handle cancellation.
        // The original code handled PENDING -> PAID only explicitly in updatePaymentStatus method body shown in step 371?
        // Step 371 `updatePaymentStatus` handled stock deduction for PAID.
        // It did NOT handle reversal if status was changed AWAY from PAID. 
        // Logic in `updateOrderStatus` DID handle (old=PAID && new=CANCELLED/FAILED).
        // Let's stick to original behavior + delegating PAID logic.
        
        orderRepository.save(order);

        // Send notifications event
        eventPublisher.publishEvent(new OrderStatusChangedEvent(this, order, oldStatus, status));

        log.info("Order payment status updated: {} to {}", orderId, status);
    }
}

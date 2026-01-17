package com.krishihub.order.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderDto;
import com.krishihub.order.entity.Order;
import com.krishihub.order.enums.OrderSource;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.order.service.strategy.OrderProcessingStrategy;
import com.krishihub.order.validator.OrderStateValidator;
import com.krishihub.shared.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderStateValidator orderStateValidator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private OrderProcessingStrategy marketplaceStrategy;

    private OrderService orderService;

    private UUID userId;
    private User buyer;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        buyer = User.builder()
                .id(userId)
                .role(User.UserRole.BUYER)
                .build();
        
        List<OrderProcessingStrategy> strategies = new ArrayList<>();
        strategies.add(marketplaceStrategy);
        
        lenient().when(marketplaceStrategy.getOrderSource()).thenReturn(OrderSource.MARKETPLACE);
        
        // Manually create the service since @InjectMocks might not handle the list correctly with init()
        orderService = new OrderService(
            orderRepository,
            userRepository,
            orderStateValidator,
            eventPublisher,
            strategies
        );
        orderService.init();
    }

    @Test
    void createOrder_Successful() {
        // Given
        CreateOrderRequest request = new CreateOrderRequest();
        request.setOrderSource(OrderSource.MARKETPLACE);
        
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .buyer(buyer)
                .status(OrderStatus.PENDING)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(buyer));
        when(marketplaceStrategy.createOrder(any(User.class), any(CreateOrderRequest.class))).thenReturn(order);
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        // When
        OrderDto result = orderService.createOrder(userId, request);

        // Then
        assertNotNull(result);
        assertEquals(order.getId(), result.getId());
        verify(eventPublisher).publishEvent(any());
        verify(orderRepository).save(any());
    }

    @Test
    void createOrder_UserNotFound_ThrowsException() {
        // Given
        CreateOrderRequest request = new CreateOrderRequest();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> orderService.createOrder(userId, request));
    }

    @Test
    void createOrder_InvalidRole_ThrowsException() {
        // Given
        buyer.setRole(User.UserRole.ADMIN);
        CreateOrderRequest request = new CreateOrderRequest();
        when(userRepository.findById(userId)).thenReturn(Optional.of(buyer));

        // When & Then
        assertThrows(BadRequestException.class, () -> orderService.createOrder(userId, request));
    }
}

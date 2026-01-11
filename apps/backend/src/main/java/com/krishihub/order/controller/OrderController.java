package com.krishihub.order.controller;

import com.krishihub.common.context.UserContextHolder;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderDto;
import com.krishihub.order.dto.UpdateOrderRequest;
import com.krishihub.order.service.OrderService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        UUID userId = UserContextHolder.getUserId();
        OrderDto order = orderService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        OrderDto order = orderService.getOrderById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role // buyer or farmer
    ) {
        UUID userId = UserContextHolder.getUserId();
        Page<OrderDto> orders = orderService.getMyOrders(userId, role, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody UpdateOrderRequest request) {
        UUID userId = UserContextHolder.getUserId();
        OrderDto order = orderService.updateOrderStatus(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Order updated successfully", order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable UUID id) {
        UUID userId = UserContextHolder.getUserId();
        orderService.cancelOrder(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}

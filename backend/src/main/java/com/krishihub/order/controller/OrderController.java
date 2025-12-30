package com.krishihub.order.controller;

import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderDto;
import com.krishihub.order.dto.UpdateOrderRequest;
import com.krishihub.order.service.OrderService;
import com.krishihub.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        String mobileNumber = authentication.getName();
        OrderDto order = orderService.createOrder(mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @PathVariable UUID id,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        OrderDto order = orderService.getOrderById(id, mobileNumber);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role // buyer or farmer
    ) {
        String mobileNumber = authentication.getName();
        Page<OrderDto> orders = orderService.getMyOrders(mobileNumber, role, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable UUID id,
            Authentication authentication,
            @RequestBody UpdateOrderRequest request) {
        String mobileNumber = authentication.getName();
        OrderDto order = orderService.updateOrderStatus(id, mobileNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Order updated successfully", order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable UUID id,
            Authentication authentication) {
        String mobileNumber = authentication.getName();
        orderService.cancelOrder(id, mobileNumber);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
}

package com.krishihub.order.service.strategy;

import com.krishihub.agristore.entity.AgriProduct;
import com.krishihub.agristore.repository.AgriProductRepository;
import com.krishihub.auth.entity.User;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderItemDto;
import com.krishihub.order.enums.OrderSource;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.entity.OrderItem;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AgriStoreOrderStrategy implements OrderProcessingStrategy {

    private final AgriProductRepository agriProductRepository;

    @Override
    public OrderSource getOrderSource() {
        return OrderSource.AGRI_STORE;
    }

    @Override
    public Order createOrder(User buyer, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Items are required for Agri Store orders");
        }
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (OrderItemDto itemDto : request.getItems()) {
             AgriProduct product = agriProductRepository.findById(itemDto.getAgriProductId())
                     .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getAgriProductId()));
             
             if (!product.getIsActive()) {
                 throw new BadRequestException("Product is not active: " + product.getName());
             }
             
             if (product.getStockQuantity() < itemDto.getQuantity().intValue()) {
                 throw new BadRequestException("Insufficient stock for product: " + product.getName());
             }
             
             BigDecimal itemTotal = product.getPrice().multiply(itemDto.getQuantity());
             
             OrderItem orderItem = OrderItem.builder()
                     .agriProduct(product)
                     .quantity(itemDto.getQuantity())
                     .pricePerUnit(product.getPrice())
                     .totalPrice(itemTotal)
                     .build();
             
             orderItems.add(orderItem);
             totalAmount = totalAmount.add(itemTotal);
        }
        
        Order order = Order.builder()
                .buyer(buyer)
                .quantity(BigDecimal.valueOf(orderItems.size())) // Logic maintained from original
                .totalAmount(totalAmount)
                .status(OrderStatus.PAYMENT_PENDING)
                .pickupLocation(request.getPickupLocation())
                .notes(request.getNotes())
                .orderSource(OrderSource.AGRI_STORE)
                .build();
                
        BigDecimal totalQty = orderItems.stream()
            .map(OrderItem::getQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setQuantity(totalQty);
        
        if (request.getPickupDate() != null) {
            order.setPickupDate(java.sql.Date.valueOf(request.getPickupDate()));
        } else {
            order.setPickupDate(com.krishihub.common.util.DateTimeProvider.today());
        }

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }
        
        return order;
    }

    @Override
    public void handlePaymentCompletion(Order order) {
        for (OrderItem item : order.getItems()) {
            AgriProduct p = item.getAgriProduct();
            p.setStockQuantity(p.getStockQuantity() - item.getQuantity().intValue());
            agriProductRepository.save(p);
        }
    }

    @Override
    public void handleOrderCancellation(Order order) {
         for (OrderItem item : order.getItems()) {
             AgriProduct p = item.getAgriProduct();
             p.setStockQuantity(p.getStockQuantity() + item.getQuantity().intValue());
             agriProductRepository.save(p);
         }
    }
}

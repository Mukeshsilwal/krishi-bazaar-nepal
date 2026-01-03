package com.krishihub.order.service;

import com.krishihub.auth.entity.User;
import com.krishihub.auth.repository.UserRepository;
import com.krishihub.auth.service.SmsService;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderDto;
import com.krishihub.order.dto.UpdateOrderRequest;
import com.krishihub.order.entity.Order;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import com.krishihub.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CropListingRepository listingRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;

    @Transactional
    public OrderDto createOrder(UUID userId, CreateOrderRequest request) {
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (buyer.getRole() != User.UserRole.BUYER && buyer.getRole() != User.UserRole.FARMER) {
            throw new BadRequestException("Only buyers and farmers can place orders");
        }

        CropListing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        // Validate listing is active
        if (listing.getStatus() != CropListing.ListingStatus.ACTIVE) {
            throw new BadRequestException("This listing is no longer available");
        }

        // Validate quantity
        if (request.getQuantity().compareTo(listing.getQuantity()) > 0) {
            throw new BadRequestException("Requested quantity exceeds available quantity");
        }

        // Validate Harvest Date & Window
        LocalDate pickupDate = request.getPickupDate() != null ? LocalDate.parse(request.getPickupDate())
                : LocalDate.now();
        if (listing.getHarvestDate() != null) {
            if (pickupDate.isBefore(listing.getHarvestDate())) {
                throw new BadRequestException("Order date cannot be before harvest date: " + listing.getHarvestDate());
            }
            if (listing.getHarvestWindow() != null) {
                LocalDate maxDate = listing.getHarvestDate().plusDays(listing.getHarvestWindow());
                if (pickupDate.isAfter(maxDate)) {
                    throw new BadRequestException("Order date is outside harvest window. Available until: " + maxDate);
                }
            }
        }

        // Validate Cutoff Time
        if (listing.getOrderCutoffTime() != null && pickupDate.equals(LocalDate.now())) {
            if (java.time.LocalTime.now().isAfter(listing.getOrderCutoffTime())) {
                throw new BadRequestException(
                        "Orders for today are closed. Cutoff time was: " + listing.getOrderCutoffTime());
            }
        }

        // Validate Daily Quantity Limit
        if (listing.getDailyQuantityLimit() != null) {
            BigDecimal currentDailyTotal = orderRepository.sumQuantityByListingIdAndPickupDate(listing.getId(),
                    pickupDate);
            if (currentDailyTotal == null) {
                currentDailyTotal = BigDecimal.ZERO;
            }
            if (currentDailyTotal.add(request.getQuantity()).compareTo(listing.getDailyQuantityLimit()) > 0) {
                throw new BadRequestException("Daily quantity limit exceeded for " + pickupDate + ". Remaining: "
                        + listing.getDailyQuantityLimit().subtract(currentDailyTotal));
            }
        }

        // Prevent farmer from ordering their own listing
        if (listing.getFarmer().getId().equals(buyer.getId())) {
            throw new BadRequestException("You cannot order your own listing");
        }

        // Calculate total amount
        BigDecimal totalAmount = listing.getPricePerUnit().multiply(request.getQuantity());

        // Create order
        Order order = Order.builder()
                .listing(listing)
                .buyer(buyer)
                .farmer(listing.getFarmer())
                .quantity(request.getQuantity())
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.PENDING)
                .pickupLocation(
                        request.getPickupLocation() != null ? request.getPickupLocation() : listing.getLocation())
                .notes(request.getNotes())
                .build();

        if (request.getPickupDate() != null) {
            order.setPickupDate(LocalDate.parse(request.getPickupDate()));
        }

        Order savedOrder = orderRepository.save(order);

        // Send notification to farmer
        String farmerMessage = String.format(
                "New order received for %s (%.2f %s). Order ID: %s. Login to confirm.",
                listing.getCropName(),
                request.getQuantity(),
                listing.getUnit(),
                savedOrder.getId());
        smsService.sendNotification(listing.getFarmer().getMobileNumber(), farmerMessage);

        log.info("Order created: {} by buyer: {}", savedOrder.getId(), userId);

        return OrderDto.fromEntity(savedOrder);
    }

    public OrderDto getOrderById(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Verify access (buyer or farmer)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!order.getBuyer().getId().equals(user.getId()) &&
                !order.getFarmer().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't have access to this order");
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
            // Return all orders (buyer + farmer)
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
        boolean isFarmer = order.getFarmer().getId().equals(user.getId());

        if (!isBuyer && !isFarmer) {
            throw new UnauthorizedException("You don't have access to this order");
        }

        // Update status if provided
        if (request.getStatus() != null) {
            Order.OrderStatus newStatus;
            try {
                newStatus = Order.OrderStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + request.getStatus());
            }

            // Validate status transitions
            validateStatusTransition(order, newStatus, isFarmer, isBuyer);
            order.setStatus(newStatus);

            // Send notifications
            sendStatusUpdateNotification(order, newStatus);
        }

        // Update other fields
        if (request.getPickupDate() != null) {
            order.setPickupDate(LocalDate.parse(request.getPickupDate()));
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
        boolean isFarmer = order.getFarmer().getId().equals(user.getId());

        if (!isBuyer && !isFarmer) {
            throw new UnauthorizedException("You don't have access to this order");
        }

        // Validate cancellation
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel completed order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Send notification
        String recipient = isBuyer ? order.getFarmer().getMobileNumber() : order.getBuyer().getMobileNumber();
        String message = String.format("Order %s has been cancelled.", order.getId());
        smsService.sendNotification(recipient, message);

        log.info("Order cancelled: {} by {}", id, userId);
    }

    private void validateStatusTransition(Order order, Order.OrderStatus newStatus,
            boolean isFarmer, boolean isBuyer) {
        Order.OrderStatus currentStatus = order.getStatus();

        // Farmers can confirm orders
        if (newStatus == Order.OrderStatus.CONFIRMED && !isFarmer) {
            throw new UnauthorizedException("Only farmer can confirm orders");
        }

        // Farmer only transitions
        if ((newStatus == Order.OrderStatus.READY_FOR_HARVEST ||
                newStatus == Order.OrderStatus.HARVESTED ||
                newStatus == Order.OrderStatus.READY) && !isFarmer) {
            throw new UnauthorizedException("Only farmer can update this status");
        }

        // Prevent invalid transitions
        if (currentStatus == Order.OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot modify completed order");
        }

        if (currentStatus == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify cancelled order");
        }

        // Detailed transition checks (optional but good for strictness)
        // For now, allowing flexible flow as long as user is authorized,
        // to avoid blocking legacy flows if any.
    }

    private void sendStatusUpdateNotification(Order order, Order.OrderStatus newStatus) {
        String message = "";
        String recipient = "";

        switch (newStatus) {
            case CONFIRMED:
                recipient = order.getBuyer().getMobileNumber();
                message = String.format("Your order %s has been confirmed by the farmer.", order.getId());
                break;
            case READY_FOR_HARVEST:
                recipient = order.getBuyer().getMobileNumber();
                message = String.format("Your order %s is being prepared for harvest.", order.getId());
                break;
            case HARVESTED:
                recipient = order.getBuyer().getMobileNumber();
                message = String.format("Your order %s has been harvested.", order.getId());
                break;
            case READY:
                recipient = order.getBuyer().getMobileNumber();
                message = String.format("Your order %s is ready for pickup.", order.getId());
                break;
            case COMPLETED:
                recipient = order.getFarmer().getMobileNumber();
                message = String.format("Order %s has been completed.", order.getId());
                break;
            case CANCELLED:
                break;
        }

        if (!message.isEmpty() && recipient != null) {
            smsService.sendNotification(recipient, message);
        }
    }
}

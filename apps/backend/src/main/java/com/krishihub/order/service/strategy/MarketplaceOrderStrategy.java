package com.krishihub.order.service.strategy;

import com.krishihub.auth.entity.User;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.dto.OrderSource;
import com.krishihub.order.dto.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketplaceOrderStrategy implements OrderProcessingStrategy {

    private final CropListingRepository listingRepository;
    private final OrderRepository orderRepository;

    @Override
    public OrderSource getOrderSource() {
        return OrderSource.MARKETPLACE;
    }

    @Override
    public Order createOrder(User buyer, CreateOrderRequest request) {
        if (request.getListingId() == null) {
            throw new BadRequestException("Listing ID is required for Marketplace orders");
        }
    
        CropListing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.getStatus() != CropListing.ListingStatus.ACTIVE) {
            throw new BadRequestException("This listing is no longer available");
        }

        if (request.getQuantity().compareTo(listing.getQuantity()) > 0) {
            throw new BadRequestException("Requested quantity exceeds available quantity");
        }

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

        if (listing.getOrderCutoffTime() != null && pickupDate.equals(LocalDate.now())) {
            if (java.time.LocalTime.now().isAfter(listing.getOrderCutoffTime())) {
                throw new BadRequestException(
                        "Orders for today are closed. Cutoff time was: " + listing.getOrderCutoffTime());
            }
        }

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

        if (listing.getFarmer().getId().equals(buyer.getId())) {
            throw new BadRequestException("You cannot order your own listing");
        }

        BigDecimal totalAmount = listing.getPricePerUnit().multiply(request.getQuantity());

        Order order = Order.builder()
                .listing(listing)
                .buyer(buyer)
                .farmer(listing.getFarmer())
                .quantity(request.getQuantity())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .pickupLocation(
                        request.getPickupLocation() != null ? request.getPickupLocation() : listing.getLocation())
                .notes(request.getNotes())
                .orderSource(OrderSource.MARKETPLACE)
                .build();

        if (request.getPickupDate() != null) {
            order.setPickupDate(LocalDate.parse(request.getPickupDate()));
        }
        return order;
    }

    @Override
    public void handlePaymentCompletion(Order order) {
        CropListing listing = order.getListing();
        BigDecimal newQuantity = listing.getQuantity().subtract(order.getQuantity());
        listing.setQuantity(newQuantity.max(BigDecimal.ZERO));
        if (listing.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            listing.setStatus(CropListing.ListingStatus.SOLD);
        }
        listingRepository.save(listing);
    }

    @Override
    public void handleOrderCancellation(Order order) {
        if (order.getStatus() == OrderStatus.PAID) return; // Only if it was pending logic, but wait. Service checked oldStatus. 
        // Logic in OrderService was calling this restoration if oldStatus==PAID. 
        // Here we just put the restoration logic. The caller decides WHEN to call this.
        
        CropListing listing = order.getListing();
        listing.setQuantity(listing.getQuantity().add(order.getQuantity()));
        if (listing.getStatus() == CropListing.ListingStatus.SOLD) {
            listing.setStatus(CropListing.ListingStatus.ACTIVE);
        }
        listingRepository.save(listing);
    }
}

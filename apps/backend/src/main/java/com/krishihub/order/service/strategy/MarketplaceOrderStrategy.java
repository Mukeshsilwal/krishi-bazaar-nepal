package com.krishihub.order.service.strategy;

import com.krishihub.auth.entity.User;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.marketplace.repository.CropListingRepository;
import com.krishihub.order.dto.CreateOrderRequest;
import com.krishihub.order.enums.OrderSource;
import com.krishihub.order.enums.OrderStatus;
import com.krishihub.order.entity.Order;
import com.krishihub.order.repository.OrderRepository;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;


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

        java.util.Date pickupDate = request.getPickupDate() != null ? java.sql.Date.valueOf(request.getPickupDate())
                : com.krishihub.common.util.DateTimeProvider.today();
        if (listing.getHarvestDate() != null) {
            if (pickupDate.before(listing.getHarvestDate())) {
                throw new BadRequestException("Order date cannot be before harvest date: " + listing.getHarvestDate());
            }
            if (listing.getHarvestWindow() != null) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(listing.getHarvestDate());
                cal.add(java.util.Calendar.DAY_OF_MONTH, listing.getHarvestWindow());
                java.util.Date maxDate = cal.getTime();
                
                if (pickupDate.after(maxDate)) {
                    throw new BadRequestException("Order date is outside harvest window. Available until: " + maxDate);
                }
            }
        }

        boolean isToday = com.krishihub.common.util.DateTimeProvider.isToday(pickupDate);
        if (listing.getOrderCutoffTime() != null && isToday) {
            // Compare only time components
            java.util.Calendar nowCal = java.util.Calendar.getInstance();
            nowCal.setTime(com.krishihub.common.util.DateTimeProvider.now());
            
            java.util.Calendar cutoffCal = java.util.Calendar.getInstance();
            cutoffCal.setTime(listing.getOrderCutoffTime());
            
            // Normalize dates to same day for time comparison
            cutoffCal.set(java.util.Calendar.YEAR, nowCal.get(java.util.Calendar.YEAR));
            cutoffCal.set(java.util.Calendar.MONTH, nowCal.get(java.util.Calendar.MONTH));
            cutoffCal.set(java.util.Calendar.DAY_OF_MONTH, nowCal.get(java.util.Calendar.DAY_OF_MONTH));
            
            if (nowCal.after(cutoffCal)) {
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
            order.setPickupDate(java.sql.Date.valueOf(request.getPickupDate()));
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

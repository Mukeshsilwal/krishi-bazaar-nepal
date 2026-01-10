package com.krishihub.order.validator;

import com.krishihub.auth.entity.User;
import com.krishihub.order.dto.OrderStatus;
import com.krishihub.shared.exception.BadRequestException;
import com.krishihub.shared.exception.UnauthorizedException;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class OrderStateValidator {

    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, EnumSet.of(OrderStatus.READY_FOR_HARVEST, OrderStatus.HARVESTED, OrderStatus.PAYMENT_PENDING, OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.READY_FOR_HARVEST, EnumSet.of(OrderStatus.HARVESTED, OrderStatus.PAYMENT_PENDING, OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.HARVESTED, EnumSet.of(OrderStatus.PAYMENT_PENDING, OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.PAYMENT_PENDING, EnumSet.of(OrderStatus.PAID, OrderStatus.READY, OrderStatus.CANCELLED),
            OrderStatus.PAID, EnumSet.of(OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.CANCELLED),
            OrderStatus.READY, EnumSet.of(OrderStatus.COMPLETED, OrderStatus.PAID),
            OrderStatus.COMPLETED, EnumSet.noneOf(OrderStatus.class),
            OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class)
    );

    public void validateTransition(OrderStatus currentStatus, OrderStatus newStatus, User actor) {
        if (currentStatus == newStatus) {
            return;
        }

        if (currentStatus == OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot modify a completed order");
        }

        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot modify a cancelled order");
        }

        Set<OrderStatus> allowed = VALID_TRANSITIONS.getOrDefault(currentStatus, EnumSet.noneOf(OrderStatus.class));
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    String.format("Invalid state transition from %s to %s", currentStatus, newStatus));
        }

        validateRoleAccess(newStatus, actor);
    }

    private void validateRoleAccess(OrderStatus newStatus, User actor) {
        boolean isFarmer = actor.getRole() == User.UserRole.FARMER;
        boolean isBuyer = actor.getRole() == User.UserRole.BUYER;

        switch (newStatus) {
            case CONFIRMED:
            case READY_FOR_HARVEST:
            case HARVESTED:
            case READY:
            case COMPLETED: // Usually system or farmer marks completed after pickup
                if (!isFarmer) {
                    throw new UnauthorizedException("Only farmers can perform this action");
                }
                break;
            case PAYMENT_PENDING:
                // System or Farmer triggers this after Harvest
                if (!isFarmer) {
                    throw new UnauthorizedException("Only farmers can request payment");
                }
                break;
            case PAID:
                // System validation only (via Payment Gateway callback)
                // We might restrict this to be updated only via Payment Service
                break;
            case CANCELLED:
                // Both can cancel, but logic might differ (handled in Service)
                break;
            default:
                break;
        }
    }
}

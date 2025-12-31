package com.krishihub.admin.dto;

import com.krishihub.auth.entity.User;
import com.krishihub.marketplace.entity.CropListing;
import com.krishihub.order.entity.Order;
import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class FarmerProfileDto {
    private User farmer; // Or a simplified UserDto

    private Map<String, Object> statistics; // listingCount, orderCount, totalSales, etc.

    private List<CropListing> recentListings;

    private List<Order> recentOrders;
}

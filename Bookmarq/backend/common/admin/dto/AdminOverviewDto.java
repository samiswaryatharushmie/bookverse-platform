package com.bookstore.common.admin.dto;

import lombok.Data;

@Data
public class AdminOverviewDto {
    private long totalUsers;
    private long totalOrders;
    private long lowStockItemsCount;
    private long pendingReviewsCount;
}

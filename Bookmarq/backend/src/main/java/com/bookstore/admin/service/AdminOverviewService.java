package com.bookstore.admin.service;

import com.bookstore.admin.dto.AdminOverviewDto;
import com.bookstore.inventory.repository.InventoryRepository;
import com.bookstore.marketing.repository.ReviewRepository;
import com.bookstore.order.repository.OrderRepository;
import com.bookstore.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminOverviewService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public AdminOverviewDto getOverview() {
        AdminOverviewDto dto = new AdminOverviewDto();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalOrders(orderRepository.count());
        dto.setLowStockItemsCount(inventoryRepository.findLowStock().size());
        dto.setPendingReviewsCount(reviewRepository.findByStatusOrderByCreatedAtDesc("PENDING").size());
        return dto;
    }
}

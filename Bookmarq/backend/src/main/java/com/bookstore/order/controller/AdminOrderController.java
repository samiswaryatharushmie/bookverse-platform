package com.bookstore.order.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ApiResponse<List<OrderDto>> getAllOrders() {
        return ApiResponse.success(orderService.getAllOrders(), "Orders retrieved");
    }

    /** Update order delivery/fulfillment status (e.g. PENDING → PROCESSING → SHIPPED → DELIVERED) */
    @PutMapping("/{id}/status")
    public ApiResponse<OrderDto> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return ApiResponse.success(orderService.updateOrderStatus(id, newStatus), "Order status updated");
    }

    /** Delete an order (only if completed/cancelled) */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable UUID id) {
        orderService.deleteOrder(id);
        return ApiResponse.success(null, "Order deleted successfully");
    }
}

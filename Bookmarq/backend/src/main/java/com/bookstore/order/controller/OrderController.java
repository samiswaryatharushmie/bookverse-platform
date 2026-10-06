package com.bookstore.order.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.order.dto.CheckoutRequest;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.order.service.OrderService;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/checkout")
    public ApiResponse<OrderDto> checkout(@Valid @RequestBody CheckoutRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(orderService.checkout(userId, request), "Order placed successfully");
    }

    @GetMapping
    public ApiResponse<List<OrderDto>> getMyOrders(Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(orderService.getMyOrders(userId), "Orders retrieved");
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<OrderDto> cancelOrder(@PathVariable UUID id, Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(orderService.cancelMyOrder(userId, id), "Order cancelled successfully");
    }

    private UUID getUserId(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

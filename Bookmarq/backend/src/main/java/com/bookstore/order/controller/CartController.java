package com.bookstore.order.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.order.dto.CartDto;
import com.bookstore.order.dto.CartItemRequest;
import com.bookstore.order.service.CartService;
import com.bookstore.user.entity.User;
import com.bookstore.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<CartDto> getCart(Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(cartService.getCart(userId), "Cart retrieved");
    }

    @PostMapping("/items")
    public ApiResponse<CartDto> addItem(@Valid @RequestBody CartItemRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(cartService.addItem(userId, request.getBookId(), request.getQuantity()), "Item added");
    }

    @DeleteMapping("/items/{bookId}")
    public ApiResponse<CartDto> removeItem(@PathVariable UUID bookId, Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(cartService.removeItem(userId, bookId), "Item removed");
    }

    @PutMapping("/items/{bookId}")
    public ApiResponse<CartDto> updateItemQuantity(@PathVariable UUID bookId, @Valid @RequestBody CartItemRequest request, Principal principal) {
        UUID userId = getUserId(principal);
        return ApiResponse.success(cartService.updateItemQuantity(userId, bookId, request.getQuantity()), "Item quantity updated");
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart(Principal principal) {
        UUID userId = getUserId(principal);
        cartService.clearCart(userId);
        return ApiResponse.<Void>success(null, "Cart cleared");
    }

    private UUID getUserId(Principal principal) {
        // Find user ID from email since principal.getName() is the email in our setup
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}

package com.bookstore.wishlist.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.wishlist.dto.WishlistDto;
import com.bookstore.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<WishlistDto> getWishlist(Principal principal) {
        return ApiResponse.success(wishlistService.getWishlist(getUserId(principal)), "Wishlist retrieved");
    }

    @PostMapping("/items/{bookId}")
    public ApiResponse<WishlistDto> addBookToWishlist(Principal principal, @PathVariable UUID bookId) {
        return ApiResponse.success(wishlistService.addBookToWishlist(getUserId(principal), bookId), "Book added to wishlist");
    }

    @DeleteMapping("/items/{bookId}")
    public ApiResponse<WishlistDto> removeBookFromWishlist(Principal principal, @PathVariable UUID bookId) {
        return ApiResponse.success(wishlistService.removeBookFromWishlist(getUserId(principal), bookId), "Book removed from wishlist");
    }

    private UUID getUserId(Principal principal) {
        if (principal instanceof org.springframework.security.authentication.UsernamePasswordAuthenticationToken authToken) {
            if (authToken.getPrincipal() instanceof com.bookstore.security.CustomUserDetails userDetails) {
                return userDetails.getId();
            }
        }
        throw new IllegalStateException("Could not extract User ID from Principal");
    }
}

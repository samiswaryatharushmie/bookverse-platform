package com.bookstore.user.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.user.dto.AddressDto;
import com.bookstore.user.dto.UpdateProfileRequest;
import com.bookstore.user.dto.UserDto;
import com.bookstore.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserProfile(userDetails.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(userDetails.getId(), request)));
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserAddresses(userDetails.getId())));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddressDto request) {
        return ResponseEntity.ok(ApiResponse.success(userService.addAddress(userDetails.getId(), request)));
    }

    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID addressId,
            @Valid @RequestBody AddressDto request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateAddress(userDetails.getId(), addressId, request)));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID addressId) {
        userService.deleteAddress(userDetails.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteUserAccount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Account deleted successfully"));
    }
}

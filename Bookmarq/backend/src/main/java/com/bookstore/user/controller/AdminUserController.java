package com.bookstore.user.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.user.dto.UserDto;
import com.bookstore.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(query, status)));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<UserDto>> createStaffAccount(
            @jakarta.validation.Valid @RequestBody com.bookstore.user.dto.CreateStaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.createStaffAccount(request)));
    }

    @PutMapping("/{userId}/roles")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRoles(
            @PathVariable UUID userId,
            @jakarta.validation.Valid @RequestBody com.bookstore.user.dto.UpdateRolesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRoles(userId, request.getRoles())));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        userService.deleteUserAccount(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status) {
        userService.updateUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status));
    }
}

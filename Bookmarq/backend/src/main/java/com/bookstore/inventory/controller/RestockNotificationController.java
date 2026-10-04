package com.bookstore.inventory.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.inventory.dto.RestockNotificationRequest;
import com.bookstore.inventory.service.RestockNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restock-notifications")
@RequiredArgsConstructor
public class RestockNotificationController {

    private final RestockNotificationService restockNotificationService;

    @PostMapping
    @PreAuthorize("permitAll()")
    public ApiResponse<Void> subscribe(@Valid @RequestBody RestockNotificationRequest request) {
        restockNotificationService.subscribe(request.getBookId(), request.getEmail());
        return ApiResponse.<Void>success(null, "We'll email you when this book is back in stock");
    }
}

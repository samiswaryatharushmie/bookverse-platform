package com.bookstore.payment.controller;

import com.bookstore.catalog.service.StorageService;
import com.bookstore.common.ApiResponse;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StorageService storageService;

    /** Upload bank transfer payment receipt */
    @PostMapping("/{id}/payment-receipt")
    public ApiResponse<OrderDto> uploadReceipt(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        String receiptUrl = storageService.storeFile(file);
        return ApiResponse.success(paymentService.uploadPaymentReceipt(id, receiptUrl), "Receipt uploaded");
    }
}

package com.bookstore.payment.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.order.dto.OrderDto;
import com.bookstore.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    /** Confirm or reject payment receipt */
    @PutMapping("/{id}/payment-status")
    public ApiResponse<OrderDto> updatePaymentStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String paymentStatus = body.get("paymentStatus");
        return ApiResponse.success(paymentService.updatePaymentStatus(id, paymentStatus), "Payment status updated");
    }

    /** Refund an order */
    @PutMapping("/{id}/refund")
    public ApiResponse<OrderDto> refundOrder(@PathVariable UUID id) {
        return ApiResponse.success(paymentService.refundOrder(id), "Order refunded successfully");
    }
}

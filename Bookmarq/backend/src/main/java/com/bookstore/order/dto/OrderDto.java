package com.bookstore.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class OrderDto {
    private UUID id;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private String paymentReceiptUrl;
    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal taxTotal;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
    private String shippingAddressSnapshot;
    private Instant createdAt;
    private List<OrderItemDto> items;
}

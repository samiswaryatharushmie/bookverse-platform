package com.bookstore.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    private String notes;

    private String paymentMethod; // CARD | BANK_TRANSFER

    private String orderNumber; // Optional, can be provided by frontend
    
    private String promoCode; // Optional promo code
}

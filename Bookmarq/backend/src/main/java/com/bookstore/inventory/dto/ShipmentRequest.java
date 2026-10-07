package com.bookstore.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ShipmentRequest {
    @NotNull(message = "Supplier is required")
    private UUID supplierId;

    private String trackingNumber;
    private LocalDate expectedDate;
    private String notes;

    @NotEmpty(message = "At least one shipment item is required")
    private List<@Valid Item> items;

    @Data
    public static class Item {
        @NotNull(message = "Book is required")
        private UUID bookId;

        @Positive(message = "Expected quantity must be greater than zero")
        private int quantityExpected;
    }
}

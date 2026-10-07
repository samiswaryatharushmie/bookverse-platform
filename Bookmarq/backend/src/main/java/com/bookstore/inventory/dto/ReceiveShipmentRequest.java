package com.bookstore.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ReceiveShipmentRequest {
    @NotEmpty(message = "At least one item's received quantity is required")
    private List<@Valid Item> items;

    @Data
    public static class Item {
        @NotNull(message = "Shipment item id is required")
        private UUID shipmentItemId;

        @PositiveOrZero(message = "Received quantity cannot be negative")
        private int quantityReceived;
    }
}

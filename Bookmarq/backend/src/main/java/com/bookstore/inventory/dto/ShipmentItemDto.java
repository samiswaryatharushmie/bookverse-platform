package com.bookstore.inventory.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ShipmentItemDto {
    private UUID id;
    private UUID bookId;
    private String bookTitle;
    private int quantityExpected;
    private Integer quantityReceived;
}

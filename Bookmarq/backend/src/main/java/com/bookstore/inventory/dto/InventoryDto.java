package com.bookstore.inventory.dto;

import com.bookstore.catalog.dto.BookDto;
import lombok.Data;
import java.util.UUID;

@Data
public class InventoryDto {
    private UUID id;
    private BookDto book;
    private int quantityOnHand;
    private int quantityReserved;
    private int reorderLevel;
    private int availableQuantity;
}

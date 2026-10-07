package com.bookstore.inventory.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ShipmentDto {
    private UUID id;
    private UUID supplierId;
    private String supplierName;
    private String status;
    private String trackingNumber;
    private LocalDate expectedDate;
    private LocalDate receivedDate;
    private String notes;
    private List<ShipmentItemDto> items;
}

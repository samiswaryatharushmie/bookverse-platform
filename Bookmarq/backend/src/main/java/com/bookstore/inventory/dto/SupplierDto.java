package com.bookstore.inventory.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SupplierDto {
    private UUID id;
    private String name;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private boolean active;
}

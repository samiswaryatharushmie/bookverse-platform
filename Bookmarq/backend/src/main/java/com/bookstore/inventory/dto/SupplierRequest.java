package com.bookstore.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;

    private String contactName;
    private String email;
    private String phone;
    private String address;
    private boolean active = true;
}

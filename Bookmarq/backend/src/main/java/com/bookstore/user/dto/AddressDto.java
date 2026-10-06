package com.bookstore.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class AddressDto {
    private UUID id;
    private String label;
    @NotBlank
    private String line1;
    private String line2;
    @NotBlank
    private String city;
    private String state;
    @NotBlank
    private String postalCode;
    @NotBlank
    private String country;
    private boolean isDefault;
}

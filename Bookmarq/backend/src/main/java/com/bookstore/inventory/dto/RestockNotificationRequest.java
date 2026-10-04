package com.bookstore.inventory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RestockNotificationRequest {
    @NotNull(message = "Book is required")
    private UUID bookId;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;
}

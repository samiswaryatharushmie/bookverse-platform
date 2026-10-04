package com.bookstore.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CuratedShelfRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;
    private int sortOrder = 0;
    private boolean active = true;
}

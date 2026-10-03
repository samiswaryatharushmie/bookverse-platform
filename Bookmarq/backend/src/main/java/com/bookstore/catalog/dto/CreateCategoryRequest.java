package com.bookstore.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateCategoryRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Slug is required")
    private String slug;
    
    private String description;
    private UUID parentId;
    private int sortOrder = 0;
    private boolean active = true;
}

package com.bookstore.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateAuthorRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Slug is required")
    private String slug;
    
    private String biography;
    private String photoUrl;
}

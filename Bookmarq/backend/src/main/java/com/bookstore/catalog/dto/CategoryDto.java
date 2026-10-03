package com.bookstore.catalog.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CategoryDto {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private UUID parentId;
    private int sortOrder;
    private boolean active;
}

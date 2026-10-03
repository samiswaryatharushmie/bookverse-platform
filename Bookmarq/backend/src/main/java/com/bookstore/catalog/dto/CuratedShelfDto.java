package com.bookstore.catalog.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CuratedShelfDto {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private int sortOrder;
    private List<BookDto> books;
}

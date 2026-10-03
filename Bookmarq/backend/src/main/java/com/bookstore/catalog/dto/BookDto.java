package com.bookstore.catalog.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class BookDto {
    private UUID id;
    private String isbn;
    private String title;
    private String slug;
    private String description;
    private BigDecimal price;
    private String coverUrl;
    private String publisher;
    private LocalDate publishedDate;
    private Integer pageCount;
    private String language;
    private CategoryDto category;
    private boolean active;
    private BigDecimal avgRating;
    private int ratingCount;

    private List<AuthorDto> authors;


}

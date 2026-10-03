package com.bookstore.catalog.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AuthorDto {
    private UUID id;
    private String name;
    private String slug;
    private String biography;
    private String photoUrl;
}

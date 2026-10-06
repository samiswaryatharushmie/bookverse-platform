package com.bookstore.wishlist.dto;

import com.bookstore.catalog.dto.BookDto;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class WishlistItemDto {
    private UUID id;
    private BookDto book;
    private Instant addedAt;
}

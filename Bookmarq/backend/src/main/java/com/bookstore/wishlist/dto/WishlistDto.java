package com.bookstore.wishlist.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class WishlistDto {
    private UUID id;
    private UUID userId;
    private List<WishlistItemDto> items;
    private Instant createdAt;
}

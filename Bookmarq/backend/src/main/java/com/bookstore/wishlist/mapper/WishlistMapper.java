package com.bookstore.wishlist.mapper;

import com.bookstore.wishlist.dto.WishlistDto;
import com.bookstore.wishlist.dto.WishlistItemDto;
import com.bookstore.wishlist.entity.Wishlist;
import com.bookstore.wishlist.entity.WishlistItem;
import com.bookstore.catalog.mapper.BookMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface WishlistMapper {
    @Mapping(target = "userId", source = "user.id")
    WishlistDto toDto(Wishlist entity);

    WishlistItemDto toDto(WishlistItem entity);
}

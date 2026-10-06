package com.bookstore.order.mapper;

import com.bookstore.order.dto.CartDto;
import com.bookstore.order.dto.CartItemDto;
import com.bookstore.order.entity.Cart;
import com.bookstore.order.entity.CartItem;
import com.bookstore.catalog.mapper.BookMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface CartMapper {

    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(entity.getItems()))")
    CartDto toDto(Cart entity);

    @Mapping(target = "total", expression = "java(item.getUnitPriceSnapshot().multiply(new java.math.BigDecimal(item.getQuantity())))")
    CartItemDto toDto(CartItem item);

    default BigDecimal calculateSubtotal(List<CartItem> items) {
        if (items == null) return BigDecimal.ZERO;
        return items.stream()
                .map(i -> i.getUnitPriceSnapshot().multiply(new BigDecimal(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

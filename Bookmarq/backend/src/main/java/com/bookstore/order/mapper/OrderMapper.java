package com.bookstore.order.mapper;

import com.bookstore.order.dto.OrderDto;
import com.bookstore.order.dto.OrderItemDto;
import com.bookstore.order.entity.Order;
import com.bookstore.order.entity.OrderItem;
import com.bookstore.catalog.mapper.BookMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {BookMapper.class})
public interface OrderMapper {
    OrderDto toDto(Order entity);
    OrderItemDto toDto(OrderItem item);
}

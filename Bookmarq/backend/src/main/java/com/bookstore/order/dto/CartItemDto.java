package com.bookstore.order.dto;

import com.bookstore.catalog.dto.BookDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CartItemDto {
    private UUID id;
    private BookDto book;
    private int quantity;
    private BigDecimal unitPriceSnapshot;
    private BigDecimal total;
}

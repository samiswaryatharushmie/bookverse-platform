package com.bookstore.order.dto;

import com.bookstore.catalog.dto.BookDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemDto {
    private UUID id;
    private BookDto book;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
}

package com.bookstore.support.dto;

import lombok.Data;

@Data
public class UpdateTicketStatusRequest {
    private String status;
    private String priority;
}

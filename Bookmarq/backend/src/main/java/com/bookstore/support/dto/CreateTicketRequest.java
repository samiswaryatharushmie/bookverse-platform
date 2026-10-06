package com.bookstore.support.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank
    private String type;
    @NotBlank
    private String subject;
    @NotBlank
    private String message;
    
    private String orderNumber;
}

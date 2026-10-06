package com.bookstore.support.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReplyRequest {
    @NotBlank
    private String message;
}

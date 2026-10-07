package com.bookstore.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class Verify2FaRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String code;
}

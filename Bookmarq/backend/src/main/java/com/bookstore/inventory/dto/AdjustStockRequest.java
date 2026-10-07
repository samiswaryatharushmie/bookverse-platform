package com.bookstore.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class AdjustStockRequest {
    
    @NotBlank(message = "Movement type is required (IN, OUT, ADJUST, RETURN)")
    private String movementType;
    
    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
    
    private String reason;
    private UUID referenceId;
}

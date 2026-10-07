package com.bookstore.inventory.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.inventory.dto.AdjustStockRequest;
import com.bookstore.inventory.dto.InventoryDto;
import com.bookstore.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inventory")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ApiResponse<Page<InventoryDto>> getAllInventory(@PageableDefault(size = 50) Pageable pageable) {
        return ApiResponse.success(inventoryService.getAllInventory(pageable), "Inventory retrieved");
    }

    @GetMapping("/low-stock")
    public ApiResponse<List<InventoryDto>> getLowStock() {
        return ApiResponse.success(inventoryService.getLowStock(), "Low stock retrieved");
    }

    @PostMapping("/{bookId}/adjust")
    public ApiResponse<InventoryDto> adjustStock(
            @PathVariable UUID bookId,
            @Valid @RequestBody AdjustStockRequest request,
            Principal principal) {
        
        // Use a dummy UUID for performedBy if principal isn't an explicit UUID structure in this simplified example
        UUID performedBy = UUID.randomUUID(); 
        
        return ApiResponse.success(inventoryService.adjustStock(bookId, request, performedBy), "Stock adjusted");
    }

    @PutMapping("/{bookId}/reorder-level")
    public ApiResponse<InventoryDto> updateReorderLevel(
            @PathVariable UUID bookId,
            @RequestBody java.util.Map<String, Integer> body) {
        Integer reorderLevel = body.get("reorderLevel");
        return ApiResponse.success(inventoryService.updateReorderLevel(bookId, reorderLevel), "Reorder level updated");
    }

    @GetMapping("/{bookId}/stock")
    @PreAuthorize("permitAll()")
    public ApiResponse<Integer> getAvailableStock(@PathVariable UUID bookId) {
        return ApiResponse.success(inventoryService.getAvailableQuantity(bookId), "Stock retrieved");
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportInventory() {
        // Simple CSV generation for demonstration
        List<InventoryDto> all = inventoryService.getAllInventory(Pageable.unpaged()).getContent();
        
        StringBuilder csv = new StringBuilder();
        csv.append("Book ID,ISBN,Title,Quantity On Hand,Quantity Reserved,Available Quantity,Reorder Level\n");
        
        for (InventoryDto i : all) {
            csv.append(i.getBook().getId()).append(",")
               .append(i.getBook().getIsbn()).append(",")
               .append("\"").append(i.getBook().getTitle().replace("\"", "\"\"")).append("\",")
               .append(i.getQuantityOnHand()).append(",")
               .append(i.getQuantityReserved()).append(",")
               .append(i.getAvailableQuantity()).append(",")
               .append(i.getReorderLevel()).append("\n");
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"inventory_export.csv\"")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv.toString());
    }
}

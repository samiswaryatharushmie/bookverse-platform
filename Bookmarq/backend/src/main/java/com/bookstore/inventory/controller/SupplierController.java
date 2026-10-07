package com.bookstore.inventory.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.inventory.dto.SupplierDto;
import com.bookstore.inventory.dto.SupplierRequest;
import com.bookstore.inventory.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/suppliers")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ApiResponse<List<SupplierDto>> getAllSuppliers() {
        return ApiResponse.success(supplierService.getAllSuppliers(), "Suppliers retrieved");
    }

    @PostMapping
    public ApiResponse<SupplierDto> createSupplier(@Valid @RequestBody SupplierRequest request) {
        return ApiResponse.success(supplierService.createSupplier(request), "Supplier created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<SupplierDto> updateSupplier(@PathVariable UUID id, @Valid @RequestBody SupplierRequest request) {
        return ApiResponse.success(supplierService.updateSupplier(id, request), "Supplier updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSupplier(@PathVariable UUID id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.<Void>success(null, "Supplier deleted successfully");
    }
}

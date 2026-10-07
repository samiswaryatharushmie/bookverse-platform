package com.bookstore.inventory.controller;

import com.bookstore.common.ApiResponse;
import com.bookstore.inventory.dto.ReceiveShipmentRequest;
import com.bookstore.inventory.dto.ShipmentDto;
import com.bookstore.inventory.dto.ShipmentRequest;
import com.bookstore.inventory.service.ShipmentService;
import com.bookstore.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/shipments")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping
    public ApiResponse<List<ShipmentDto>> getAllShipments() {
        return ApiResponse.success(shipmentService.getAllShipments(), "Shipments retrieved");
    }

    @GetMapping("/{id}")
    public ApiResponse<ShipmentDto> getShipment(@PathVariable UUID id) {
        return ApiResponse.success(shipmentService.getShipment(id), "Shipment retrieved");
    }

    @PostMapping
    public ApiResponse<ShipmentDto> createShipment(@Valid @RequestBody ShipmentRequest request) {
        return ApiResponse.success(shipmentService.createShipment(request), "Shipment created successfully");
    }

    @PutMapping("/{id}/receive")
    public ApiResponse<ShipmentDto> receiveShipment(
            @PathVariable UUID id,
            @Valid @RequestBody ReceiveShipmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.success(shipmentService.receiveShipment(id, request, userDetails.getId()), "Shipment received and inventory updated");
    }
}

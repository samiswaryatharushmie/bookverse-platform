package com.bookstore.inventory.service;

import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.dto.AdjustStockRequest;
import com.bookstore.inventory.dto.ReceiveShipmentRequest;
import com.bookstore.inventory.dto.ShipmentDto;
import com.bookstore.inventory.dto.ShipmentItemDto;
import com.bookstore.inventory.dto.ShipmentRequest;
import com.bookstore.inventory.entity.Shipment;
import com.bookstore.inventory.entity.ShipmentItem;
import com.bookstore.inventory.entity.Supplier;
import com.bookstore.inventory.repository.ShipmentRepository;
import com.bookstore.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final SupplierRepository supplierRepository;
    private final BookRepository bookRepository;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public List<ShipmentDto> getAllShipments() {
        return shipmentRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentDto getShipment(UUID id) {
        return toDto(shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found")));
    }

    @Transactional
    public ShipmentDto createShipment(ShipmentRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        Shipment shipment = new Shipment();
        shipment.setSupplier(supplier);
        shipment.setStatus("PENDING");
        shipment.setTrackingNumber(request.getTrackingNumber());
        shipment.setExpectedDate(request.getExpectedDate());
        shipment.setNotes(request.getNotes());

        for (ShipmentRequest.Item itemReq : request.getItems()) {
            var book = bookRepository.findById(itemReq.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + itemReq.getBookId()));
            ShipmentItem item = new ShipmentItem();
            item.setBook(book);
            item.setQuantityExpected(itemReq.getQuantityExpected());
            shipment.addItem(item);
        }

        return toDto(shipmentRepository.save(shipment));
    }

    @Transactional
    public ShipmentDto receiveShipment(UUID shipmentId, ReceiveShipmentRequest request, UUID performedBy) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found"));

        if ("RECEIVED".equals(shipment.getStatus())) {
            throw new BadRequestException("Shipment has already been received");
        }

        Map<UUID, Integer> receivedByItemId = request.getItems().stream()
                .collect(Collectors.toMap(ReceiveShipmentRequest.Item::getShipmentItemId, ReceiveShipmentRequest.Item::getQuantityReceived));

        for (ShipmentItem item : shipment.getItems()) {
            Integer receivedQty = receivedByItemId.get(item.getId());
            if (receivedQty == null) {
                throw new BadRequestException("Missing received quantity for shipment item " + item.getId());
            }
            item.setQuantityReceived(receivedQty);

            if (receivedQty > 0) {
                AdjustStockRequest adjust = new AdjustStockRequest();
                adjust.setMovementType("IN");
                adjust.setQuantity(receivedQty);
                adjust.setReason("Shipment received from " + shipment.getSupplier().getName());
                adjust.setReferenceId(shipment.getId());
                inventoryService.adjustStock(item.getBook().getId(), adjust, performedBy);
            }
        }

        shipment.setStatus("RECEIVED");
        shipment.setReceivedDate(LocalDate.now());
        shipment.setReceivedBy(performedBy);

        return toDto(shipmentRepository.save(shipment));
    }

    private ShipmentDto toDto(Shipment s) {
        ShipmentDto dto = new ShipmentDto();
        dto.setId(s.getId());
        dto.setSupplierId(s.getSupplier().getId());
        dto.setSupplierName(s.getSupplier().getName());
        dto.setStatus(s.getStatus());
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setExpectedDate(s.getExpectedDate());
        dto.setReceivedDate(s.getReceivedDate());
        dto.setNotes(s.getNotes());
        dto.setItems(s.getItems().stream().map(this::toDto).collect(Collectors.toList()));
        return dto;
    }

    private ShipmentItemDto toDto(ShipmentItem i) {
        ShipmentItemDto dto = new ShipmentItemDto();
        dto.setId(i.getId());
        dto.setBookId(i.getBook().getId());
        dto.setBookTitle(i.getBook().getTitle());
        dto.setQuantityExpected(i.getQuantityExpected());
        dto.setQuantityReceived(i.getQuantityReceived());
        return dto;
    }
}

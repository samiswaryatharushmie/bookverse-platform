package com.bookstore.inventory.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.repository.BookRepository;
import com.bookstore.common.exception.BadRequestException;
import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.dto.AdjustStockRequest;
import com.bookstore.inventory.dto.InventoryDto;
import com.bookstore.inventory.entity.Inventory;
import com.bookstore.inventory.mapper.InventoryMapper;
import com.bookstore.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final BookRepository bookRepository;
    private final StockMovementService stockMovementService;
    private final InventoryMapper inventoryMapper;
    private final RestockNotificationService restockNotificationService;

    @Transactional(readOnly = true)
    public Page<InventoryDto> getAllInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(inventoryMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(inventoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryDto adjustStock(UUID bookId, AdjustStockRequest request, UUID performedBy) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for book: " + bookId));

        int availableBefore = inventory.getAvailableQuantity();
        int quantity = request.getQuantity();
        String type = request.getMovementType().toUpperCase();

        if (type.equals("OUT")) {
            if (inventory.getAvailableQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock to deduct");
            }
            inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
        } else if (type.equals("IN") || type.equals("RETURN")) {
            inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
        } else if (type.equals("ADJUST")) {
            // ADJUST can be positive or negative. We'll assume the quantity in the request is the delta.
            // If it's a negative adjust, check bounds.
            if (quantity < 0 && inventory.getAvailableQuantity() < Math.abs(quantity)) {
                 throw new BadRequestException("Insufficient stock for negative adjustment");
            }
            inventory.setQuantityOnHand(inventory.getQuantityOnHand() + quantity);
        } else {
            throw new BadRequestException("Invalid movement type");
        }

        stockMovementService.recordMovement(
                inventory.getBook(), type, quantity, request.getReason(), request.getReferenceId(), performedBy
        );

        InventoryDto result = inventoryMapper.toDto(inventoryRepository.save(inventory));

        if (availableBefore <= 0 && inventory.getAvailableQuantity() > 0) {
            restockNotificationService.notifySubscribers(bookId);
        }

        return result;
    }

    @Transactional
    public void reserveStock(UUID bookId, int quantity, UUID referenceId) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for book: " + bookId));

        if (inventory.getAvailableQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock available");
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        inventoryRepository.save(inventory);
        
        // Optionally record a RESERVE movement, though typically handled via order tables.
    }

    @Transactional
    public void releaseStock(UUID bookId, int quantity, UUID referenceId) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for book: " + bookId));

        if (inventory.getQuantityReserved() < quantity) {
            throw new BadRequestException("Cannot release more than reserved");
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void deductStock(UUID bookId, int quantity, UUID referenceId, UUID performedBy) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for book: " + bookId));

        if (inventory.getQuantityReserved() < quantity) {
            throw new BadRequestException("Cannot deduct more than reserved. Ensure stock was reserved first.");
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - quantity);
        inventory.setQuantityOnHand(inventory.getQuantityOnHand() - quantity);
        
        stockMovementService.recordMovement(inventory.getBook(), "OUT", quantity, "Order fulfillment", referenceId, performedBy);
        
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void initializeInventoryForBook(Book book) {
        if (inventoryRepository.findByBookId(book.getId()).isEmpty()) {
            Inventory inventory = new Inventory();
            inventory.setBook(book);
            inventory.setQuantityOnHand(50);
            inventory.setQuantityReserved(0);
            inventory.setReorderLevel(10);
            inventoryRepository.save(inventory);
        }
    }

    @Transactional
    public InventoryDto updateReorderLevel(UUID bookId, int reorderLevel) {
        Inventory inventory = inventoryRepository.findByBookId(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for book: " + bookId));
        if (reorderLevel < 0) {
            throw new BadRequestException("Reorder level cannot be negative");
        }
        inventory.setReorderLevel(reorderLevel);
        return inventoryMapper.toDto(inventoryRepository.save(inventory));
    }

    @Transactional(readOnly = true)
    public int getAvailableQuantity(UUID bookId) {
        return inventoryRepository.findByBookId(bookId)
                .map(Inventory::getAvailableQuantity)
                .orElse(0);
    }
}

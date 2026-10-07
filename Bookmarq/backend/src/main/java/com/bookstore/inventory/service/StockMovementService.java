package com.bookstore.inventory.service;

import com.bookstore.inventory.entity.StockMovement;
import com.bookstore.inventory.repository.StockMovementRepository;
import com.bookstore.catalog.entity.Book;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordMovement(Book book, String type, int quantity, String reason, UUID referenceId, UUID performedBy) {
        StockMovement movement = new StockMovement();
        movement.setBook(book);
        movement.setMovementType(type);
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setReferenceId(referenceId);
        movement.setPerformedBy(performedBy);
        
        stockMovementRepository.save(movement);
    }
}

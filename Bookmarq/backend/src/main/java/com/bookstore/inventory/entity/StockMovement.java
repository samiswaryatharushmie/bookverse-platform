package com.bookstore.inventory.entity;

import com.bookstore.catalog.entity.Book;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Getter
@Setter
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, length = 10)
    private String movementType; // IN, OUT, ADJUST, RETURN

    @Column(nullable = false)
    private int quantity;

    @Column(length = 500)
    private String reason;

    private UUID referenceId;

    private UUID performedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}

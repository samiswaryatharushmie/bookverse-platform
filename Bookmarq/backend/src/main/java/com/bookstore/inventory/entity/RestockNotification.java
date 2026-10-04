package com.bookstore.inventory.entity;

import com.bookstore.catalog.entity.Book;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restock_notifications")
@Getter
@Setter
public class RestockNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false)
    private boolean notified = false;

    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.TIMESTAMP)
    private Instant notifiedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}

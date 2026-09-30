package com.bookstore.catalog.entity;

import com.bookstore.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "curated_shelves")
@Getter
@Setter
public class CuratedShelf extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 120, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "curated_shelf_books",
            joinColumns = @JoinColumn(name = "shelf_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    @OrderColumn(name = "sort_order")
    private List<Book> books = new ArrayList<>();
}

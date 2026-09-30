package com.bookstore.catalog.entity;

import com.bookstore.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "books")
@Getter
@Setter
public class Book extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20, unique = true)
    private String isbn;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 350, unique = true)
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(length = 500)
    private String coverUrl;

    @Column(length = 200)
    private String publisher;

    private LocalDate publishedDate;

    private Integer pageCount;

    @Column(nullable = false, length = 10)
    private String language = "en";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(nullable = false)
    private int ratingCount = 0;



    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "book_authors",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )
    private Set<Author> authors = new HashSet<>();
    
    public void addAuthor(Author author) {
        this.authors.add(author);
    }
    
    public void removeAuthor(Author author) {
        this.authors.remove(author);
    }
}

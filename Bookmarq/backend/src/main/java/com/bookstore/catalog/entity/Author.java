package com.bookstore.catalog.entity;

import com.bookstore.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "authors")
@Getter
@Setter
public class Author extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 220, unique = true)
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String biography;

    @Column(length = 500)
    private String photoUrl;
}

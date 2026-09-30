package com.bookstore.catalog.entity;

import com.bookstore.common.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;

import java.util.UUID;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Category extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 120, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean active = true;
}

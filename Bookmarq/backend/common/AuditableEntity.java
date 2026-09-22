package com.bookstore.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Base entity providing automatic timestamp auditing.
 *
 * <p>All entities that need {@code created_at} and {@code updated_at}
 * should extend this class. Timestamps are set automatically via
 * JPA lifecycle callbacks.</p>
 */
@Getter
@Setter
@MappedSuperclass
public abstract class AuditableEntity {

    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.TIMESTAMP)
    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}

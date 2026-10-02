package com.bookstore.catalog.repository;

import com.bookstore.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentId(UUID parentId);
    List<Category> findByActiveTrueOrderBySortOrderAsc();
}

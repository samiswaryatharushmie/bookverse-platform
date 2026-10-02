package com.bookstore.catalog.repository;

import com.bookstore.catalog.entity.CuratedShelf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CuratedShelfRepository extends JpaRepository<CuratedShelf, UUID> {
    List<CuratedShelf> findByActiveTrueOrderBySortOrderAsc();
}

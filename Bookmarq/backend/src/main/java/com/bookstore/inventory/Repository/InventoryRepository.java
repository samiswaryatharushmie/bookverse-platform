package com.bookstore.inventory.repository;

import com.bookstore.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByBookId(UUID bookId);
    
    @Query("SELECT i FROM Inventory i WHERE i.quantityOnHand < i.reorderLevel")
    List<Inventory> findLowStock();
}

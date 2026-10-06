package com.bookstore.order.repository;

import com.bookstore.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    java.util.Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByUserIdAndStatusAndItemsBookId(UUID userId, String status, UUID bookId);

    @org.springframework.data.jpa.repository.Query("SELECT i.book.id FROM Order o JOIN o.items i WHERE o.id IN (SELECT o2.id FROM Order o2 JOIN o2.items i2 WHERE i2.book.id = :bookId) AND i.book.id != :bookId GROUP BY i.book.id ORDER BY COUNT(i.book.id) DESC")
    List<UUID> findAlsoBoughtBookIds(@org.springframework.data.repository.query.Param("bookId") UUID bookId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT i.book.category.id FROM Order o JOIN o.items i WHERE o.user.id = :userId GROUP BY i.book.category.id ORDER BY COUNT(i.book.category.id) DESC")
    List<UUID> findTopCategoriesByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId, org.springframework.data.domain.Pageable pageable);
}

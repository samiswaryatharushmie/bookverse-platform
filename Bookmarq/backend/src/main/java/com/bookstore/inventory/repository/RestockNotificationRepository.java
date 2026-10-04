package com.bookstore.inventory.repository;

import com.bookstore.inventory.entity.RestockNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestockNotificationRepository extends JpaRepository<RestockNotification, UUID> {
    Optional<RestockNotification> findByBookIdAndEmailIgnoreCaseAndNotifiedFalse(UUID bookId, String email);

    List<RestockNotification> findByBookIdAndNotifiedFalse(UUID bookId);
}

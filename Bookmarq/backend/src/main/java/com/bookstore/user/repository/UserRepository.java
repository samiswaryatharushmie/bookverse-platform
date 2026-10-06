package com.bookstore.user.repository;

import com.bookstore.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * Atomically increments the failed-login counter and locks the account once it
     * reaches maxAttempts, all in a single UPDATE. Avoids the read-modify-write race
     * that a load-then-save approach has under concurrent failed-login attempts
     * (e.g. a brute-force attack firing requests in parallel).
     */
    @Modifying
    @Query("UPDATE User u SET u.failedLoginCount = u.failedLoginCount + 1, " +
           "u.lockedUntil = CASE WHEN u.failedLoginCount + 1 >= :maxAttempts THEN :lockUntil ELSE u.lockedUntil END " +
           "WHERE u.email = :email")
    int incrementFailedLoginCount(@Param("email") String email, @Param("maxAttempts") int maxAttempts, @Param("lockUntil") Instant lockUntil);

    @Query("SELECT u FROM User u WHERE " +
           "(:query IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:status IS NULL OR u.status = :status)")
    List<User> searchUsers(@Param("query") String query, @Param("status") String status);
}

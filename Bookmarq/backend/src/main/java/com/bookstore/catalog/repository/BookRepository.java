package com.bookstore.catalog.repository;

import com.bookstore.catalog.entity.Book;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID>, JpaSpecificationExecutor<Book> {
    Optional<Book> findBySlug(String slug);
    Optional<Book> findByIsbn(String isbn);
    
    @EntityGraph(attributePaths = {"authors", "category"})
    @Query("SELECT b FROM Book b")
    List<Book> findAllWithDetails();
}

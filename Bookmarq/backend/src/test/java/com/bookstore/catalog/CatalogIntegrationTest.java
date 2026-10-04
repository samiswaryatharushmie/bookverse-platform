package com.bookstore.catalog;

import com.bookstore.catalog.dto.BookDto;
import com.bookstore.catalog.service.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("local")
public class CatalogIntegrationTest {

    @Autowired
    private BookService bookService;

    // UUIDs from V2__seed.sql
    private static final UUID CAT_FICTION = UUID.fromString("30000000-0000-0000-0000-000000000001");
    private static final UUID CAT_SCI_FI = UUID.fromString("30000000-0000-0000-0000-000000000003");

    @Test
    @Transactional(readOnly = true)
    public void testSearchPerformance() {
        // Warm up the JPA cache/connections
        bookService.getBooks(null, null, null, null, null, true, null, PageRequest.of(0, 20));

        long startTime = System.currentTimeMillis();
        
        Page<BookDto> results = bookService.getBooks("Dune", null, null, null, null, true, null, PageRequest.of(0, 20));
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;

        System.out.println("Search 'Dune' took " + duration + " ms");
        assertTrue(duration < 500, "Search query took longer than 500ms: " + duration + "ms");
        assertThat(results.getContent()).isNotEmpty();
        assertThat(results.getContent().get(0).getTitle()).contains("Dune");
    }

    @Test
    @Transactional(readOnly = true)
    public void testFilterCombinations() {
        // Filter by Category
        Page<BookDto> sciFiBooks = bookService.getBooks(null, CAT_SCI_FI, null, null, null, true, null, PageRequest.of(0, 20));
        assertThat(sciFiBooks.getContent()).allMatch(b -> b.getCategory().getId().equals(CAT_SCI_FI));

        // Filter by Price range (All books are 19.99 now)
        Page<BookDto> affordableBooks = bookService.getBooks(null, null, BigDecimal.ZERO, new BigDecimal("25.00"), null, true, null, PageRequest.of(0, 20));
        assertThat(affordableBooks.getContent()).isNotEmpty();
        assertThat(affordableBooks.getContent()).allMatch(b -> b.getPrice().compareTo(new BigDecimal("25.00")) <= 0);

        // Filter by Search Term + Price
        Page<BookDto> bBooks = bookService.getBooks("Brave", null, new BigDecimal("10.00"), new BigDecimal("25.00"), null, true, null, PageRequest.of(0, 20));
        assertThat(bBooks.getContent()).isNotEmpty();
        assertThat(bBooks.getContent()).allMatch(b -> b.getTitle().contains("Brave") && b.getPrice().compareTo(new BigDecimal("25.00")) <= 0);
    }
}

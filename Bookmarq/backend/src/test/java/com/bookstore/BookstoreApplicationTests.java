package com.bookstore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verifies the Spring context loads successfully.
 * Uses the 'local' profile configuration.
 */
// Disabled until MSSQL is running — uncomment when SQL Server is available locally
// @SpringBootTest
// @ActiveProfiles("local")
class BookstoreApplicationTests {

    @Test
    void contextLoads() {
        // Placeholder — will be activated once MSSQL is available
    }
}

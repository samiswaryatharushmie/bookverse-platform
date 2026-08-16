package com.bookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main entry point for the Bookstore application.
 *
 * <p>Bootstraps the Spring Boot context, enabling auto-configuration
 * for JPA, Security, Flyway migrations, and Actuator health checks.</p>
 */
@SpringBootApplication
@EnableCaching
public class BookstoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookstoreApplication.class, args);
    }
}

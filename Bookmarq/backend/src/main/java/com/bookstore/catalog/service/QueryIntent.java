package com.bookstore.catalog.service;

import java.math.BigDecimal;
import java.util.Optional;

public class QueryIntent {
    private String cleanQuery;
    private BigDecimal maxPrice;
    private BigDecimal minPrice;
    private Double minRating;
    private String authorName;
    private String isbn;

    public QueryIntent(String cleanQuery) {
        this.cleanQuery = cleanQuery;
    }

    // Getters
    public String getCleanQuery() { return cleanQuery; }
    public Optional<BigDecimal> getMaxPrice() { return Optional.ofNullable(maxPrice); }
    public Optional<BigDecimal> getMinPrice() { return Optional.ofNullable(minPrice); }
    public Optional<Double> getMinRating() { return Optional.ofNullable(minRating); }
    public Optional<String> getAuthorName() { return Optional.ofNullable(authorName); }
    public Optional<String> getIsbn() { return Optional.ofNullable(isbn); }

    // Setters
    public void setCleanQuery(String cleanQuery) { this.cleanQuery = cleanQuery; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public void setMinRating(Double minRating) { this.minRating = minRating; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    @Override
    public String toString() {
        return "QueryIntent{" +
                "cleanQuery='" + cleanQuery + '\'' +
                ", maxPrice=" + maxPrice +
                ", minPrice=" + minPrice +
                ", minRating=" + minRating +
                ", authorName='" + authorName + '\'' +
                ", isbn='" + isbn + '\'' +
                '}';
    }
}

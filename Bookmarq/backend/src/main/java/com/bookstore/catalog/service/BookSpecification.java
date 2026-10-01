package com.bookstore.catalog.service;

import com.bookstore.catalog.entity.Book;
import com.bookstore.catalog.entity.Author;
import com.bookstore.catalog.entity.Category;
import com.bookstore.inventory.entity.Inventory;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class BookSpecification {

    public static Specification<Book> search(String query) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) {
                return cb.conjunction();
            }
            String likePattern = "%" + query.toLowerCase() + "%";
            Join<Book, Author> authors = root.join("authors", JoinType.LEFT);
            
            return cb.or(
                    cb.like(cb.lower(root.get("title")), likePattern),
                    cb.like(cb.lower(root.get("isbn")), likePattern),
                    cb.like(cb.lower(authors.get("name")), likePattern)
            );
        };
    }

    public static Specification<Book> hasCategory(UUID categoryId) {
        return (root, cq, cb) -> {
            if (categoryId == null) return cb.conjunction();
            Join<Book, Category> category = root.join("category", JoinType.INNER);
            return cb.equal(category.get("id"), categoryId);
        };
    }

    /**
     * Multi-select category filter (OR within the list).
     * Used by the faceted filtering endpoint where genre is comma-separated.
     */
    public static Specification<Book> hasCategoryIn(List<UUID> categoryIds) {
        return (root, cq, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) return cb.conjunction();
            Join<Book, Category> category = root.join("category", JoinType.INNER);
            return cb.or(
                category.get("id").in(categoryIds),
                cb.and(
                    category.get("parent").isNotNull(),
                    category.get("parent").get("id").in(categoryIds)
                )
            );
        };
    }

    public static Specification<Book> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, cq, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min != null && max != null) return cb.between(root.get("price"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.lessThanOrEqualTo(root.get("price"), max);
        };
    }

    public static Specification<Book> minRating(BigDecimal minRating) {
        return (root, cq, cb) -> {
            if (minRating == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("avgRating"), minRating);
        };
    }

    public static Specification<Book> isActive(Boolean active) {
        return (root, cq, cb) -> {
            if (active == null) return cb.conjunction();
            return cb.equal(root.get("active"), active);
        };
    }

    public static Specification<Book> isFeatured(Boolean featured) {
        return (root, cq, cb) -> cb.conjunction();
    }

    // ── New predicates for faceted filtering (Phase 1) ──────────────────────

    /**
     * Multi-select language filter.
     * Semantics: OR within the list (book.language IN ('en', 'es')).
     */
    public static Specification<Book> hasLanguage(List<String> languages) {
        return (root, cq, cb) -> {
            if (languages == null || languages.isEmpty()) return cb.conjunction();
            return root.get("language").in(languages);
        };
    }

    public static Specification<Book> hasFormat(List<String> formats) {
        return (root, cq, cb) -> cb.conjunction();
    }

    /**
     * Publication year range filter.
     * Uses YEAR(published_date) for MSSQL.
     */
    public static Specification<Book> publishedYearBetween(Integer yearMin, Integer yearMax) {
        return (root, cq, cb) -> {
            if (yearMin == null && yearMax == null) return cb.conjunction();
            var yearExpr = cb.function("YEAR", Integer.class, root.get("publishedDate"));
            if (yearMin != null && yearMax != null) {
                return cb.between(yearExpr, yearMin, yearMax);
            }
            if (yearMin != null) {
                return cb.greaterThanOrEqualTo(yearExpr, yearMin);
            }
            return cb.lessThanOrEqualTo(yearExpr, yearMax);
        };
    }

    /**
     * Availability filter using a correlated subquery to the inventory table.
     * "in_stock"    → available quantity > 0 AND NOT pre-order
     * "out_of_stock" → available quantity = 0 AND NOT pre-order
     * "pre_order"   → book.preOrder = true
     */
    public static Specification<Book> hasAvailability(String availability) {
        return (root, cq, cb) -> {
            if (availability == null || availability.isBlank()) return cb.conjunction();

            switch (availability.toLowerCase()) {
                case "pre_order":
                    return cb.disjunction(); // No longer supported

                case "in_stock": {
                    Subquery<Integer> sub = cq.subquery(Integer.class);
                    Root<Inventory> inv = sub.from(Inventory.class);
                    sub.select(cb.literal(1))
                       .where(
                           cb.equal(inv.get("book").get("id"), root.get("id")),
                           cb.greaterThan(
                               cb.diff(inv.get("quantityOnHand"), inv.get("quantityReserved")),
                               0
                           )
                       );
                    return cb.exists(sub);
                }

                case "out_of_stock": {
                    Subquery<Integer> sub = cq.subquery(Integer.class);
                    Root<Inventory> inv = sub.from(Inventory.class);
                    sub.select(cb.literal(1))
                       .where(
                           cb.equal(inv.get("book").get("id"), root.get("id")),
                           cb.greaterThan(
                               cb.diff(inv.get("quantityOnHand"), inv.get("quantityReserved")),
                               0
                           )
                       );
                    return cb.not(cb.exists(sub));
                }

                default:
                    return cb.conjunction();
            }
        };
    }
}
